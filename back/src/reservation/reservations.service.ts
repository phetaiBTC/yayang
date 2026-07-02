import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Collection, EntityManager } from '@mikro-orm/core';
import {
  Book,
  Customer,
  Employee,
  Reservation,
  ReservationDetail,
} from '../entities';
import { serialize } from '../common/serialize';
import { CreateReservationDto } from './dto/reservation.dto';

// Allowed status transitions (state machine).
const TRANSITIONS: Record<string, string[]> = {
  booked: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class ReservationsService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Create a booked reservation with line items. Never touches stock.
   * `empId` is null for customer self-service reservations (no staff yet).
   * `deposit` (optional) records an up-front deposit paid at booking time;
   * it must be > 0 and not exceed the reservation total.
   */
  async create(empId: number | null, dto: CreateReservationDto, deposit?: number) {
    const customer = await this.em.findOne(Customer, { cusId: dto.cusId });
    if (!customer) throw new BadRequestException(`Customer ${dto.cusId} does not exist`);

    const bookIds = [...new Set(dto.lines.map((l) => l.bookId))];
    const books = await this.em.find(Book, { bookId: { $in: bookIds } });
    const missing = bookIds.filter((id) => !books.some((b) => b.bookId === id));
    if (missing.length) throw new BadRequestException(`Unknown book(s): ${missing.join(', ')}`);
    const priceById = new Map(books.map((b) => [b.bookId, b.price]));

    const total = dto.lines.reduce((sum, l) => sum + l.qty * Number(priceById.get(l.bookId)!), 0);
    if (deposit != null) {
      if (deposit <= 0) throw new BadRequestException('Deposit must be greater than 0');
      if (deposit > total) throw new BadRequestException('Deposit cannot exceed the total');
    }

    const resId = await this.em.transactional(async (tem) => {
      const reservation = tem.create(
        Reservation,
        {
          customer: tem.getReference(Customer, dto.cusId as never),
          employee: empId != null ? tem.getReference(Employee, empId as never) : undefined,
          deposit: deposit != null ? deposit.toFixed(2) : '0',
        },
        { partial: true },
      );
      tem.persist(reservation);

      for (const line of dto.lines) {
        const detail = tem.create(
          ReservationDetail,
          {
            reservation,
            book: tem.getReference(Book, line.bookId as never),
            qty: line.qty,
            price: priceById.get(line.bookId)!, // snapshot
          },
          { partial: true },
        );
        tem.persist(detail);
      }
      await tem.flush();
      return reservation.resId;
    });

    return this.findOne(resId);
  }

  async recordDeposit(id: number, deposit: number) {
    const reservation = await this.em.findOne(Reservation, { resId: id });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status !== 'booked' && reservation.status !== 'ready') {
      throw new BadRequestException(`Cannot record a deposit on a ${reservation.status} reservation`);
    }
    reservation.deposit = deposit.toFixed(2);
    await this.em.flush();
    return this.findOne(id);
  }

  async changeStatus(id: number, status: string) {
    await this.em.transactional(async (tem) => {
      const reservation = await tem.findOne(
        Reservation,
        { resId: id },
        { populate: ['details', 'details.book'] },
      );
      if (!reservation) throw new NotFoundException('Reservation not found');

      const allowed = TRANSITIONS[reservation.status] ?? [];
      if (!allowed.includes(status)) {
        throw new BadRequestException(
          `Cannot change status from ${reservation.status} to ${status}`,
        );
      }

      // booked → ready is gated on the books being in stock.
      if (status === 'ready') {
        const short = this.shortBooks(reservation.details);
        if (short.length) {
          throw new BadRequestException(`Not ready — insufficient stock: ${short.join('; ')}`);
        }
      }

      reservation.status = status;
      await tem.flush();
    });
    return this.findOne(id);
  }

  async findAll() {
    return this.listWhere({});
  }

  /** Reservations belonging to a single customer (for the customer self-service view). */
  async findAllForCustomer(cusId: number) {
    return this.listWhere({ customer: cusId });
  }

  private async listWhere(where: Record<string, any>) {
    const reservations = await this.em.find(
      Reservation,
      where,
      {
        populate: ['customer', 'employee', 'details', 'details.book'],
        orderBy: { resId: 'DESC' },
      },
    );
    return reservations.map((r) => {
      const total = this.total(r.details);
      return {
        ...serialize(r),
        lineCount: r.details.length,
        total: total.toFixed(2),
        balance: (total - Number(r.deposit)).toFixed(2),
        readyEligible: r.status === 'booked' && this.shortBooks(r.details).length === 0,
      };
    });
  }

  async findOne(id: number) {
    const reservation = await this.em.findOne(
      Reservation,
      { resId: id },
      { populate: ['customer', 'employee', 'details', 'details.book'] },
    );
    if (!reservation) throw new NotFoundException('Reservation not found');
    const total = this.total(reservation.details);
    return {
      ...serialize(reservation),
      total: total.toFixed(2),
      balance: (total - Number(reservation.deposit)).toFixed(2),
      readyEligible:
        reservation.status === 'booked' && this.shortBooks(reservation.details).length === 0,
    };
  }

  private total(details: Collection<ReservationDetail>): number {
    return details.getItems().reduce((sum, d) => sum + d.qty * Number(d.price), 0);
  }

  /** Books whose summed reserved qty exceeds current stock. */
  private shortBooks(details: Collection<ReservationDetail>): string[] {
    const demand = new Map<number, { want: number; have: number; title: string }>();
    for (const d of details.getItems()) {
      const entry = demand.get(d.book.bookId) ?? { want: 0, have: d.book.stock, title: d.book.title };
      entry.want += d.qty;
      demand.set(d.book.bookId, entry);
    }
    return [...demand.values()]
      .filter((e) => e.want > e.have)
      .map((e) => `${e.title} (need ${e.want}, have ${e.have})`);
  }
}
