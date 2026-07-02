import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book, Customer, Employee, Sale, SaleDetail } from '../entities';
import { serialize } from '../common/serialize';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Record a sale: validate stock, decrement it, compute total — atomically.
   * `empId` is null for customer self-checkout sales (no staff).
   */
  async create(empId: number | null, dto: CreateSaleDto) {
    const customer = await this.em.findOne(Customer, { cusId: dto.cusId });
    if (!customer) throw new BadRequestException(`Customer ${dto.cusId} does not exist`);

    const bookIds = [...new Set(dto.lines.map((l) => l.bookId))];
    const existing = await this.em.find(Book, { bookId: { $in: bookIds } });
    const missing = bookIds.filter((id) => !existing.some((b) => b.bookId === id));
    if (missing.length) throw new BadRequestException(`Unknown book(s): ${missing.join(', ')}`);

    // Summed demand per book (handles duplicate lines for the same book).
    const demand = new Map<number, number>();
    for (const line of dto.lines) {
      demand.set(line.bookId, (demand.get(line.bookId) ?? 0) + line.qty);
    }

    const saleId = await this.em.transactional(async (tem) => {
      const books = await tem.find(Book, { bookId: { $in: bookIds } });
      const bookById = new Map(books.map((b) => [b.bookId, b]));

      // Stock validation against summed demand.
      const shortfalls = [...demand.entries()]
        .filter(([id, want]) => want > bookById.get(id)!.stock)
        .map(([id, want]) => `book ${id} (need ${want}, have ${bookById.get(id)!.stock})`);
      if (shortfalls.length) {
        throw new BadRequestException(`Insufficient stock: ${shortfalls.join('; ')}`);
      }

      let total = 0;
      const sale = tem.create(
        Sale,
        {
          customer: tem.getReference(Customer, dto.cusId as never),
          employee: empId != null ? tem.getReference(Employee, empId as never) : undefined,
          paymentMethod: dto.paymentMethod,
          total: '0',
        },
        { partial: true },
      );
      tem.persist(sale);

      for (const line of dto.lines) {
        const book = bookById.get(line.bookId)!;
        const price = book.price; // server-set snapshot
        total += line.qty * Number(price);
        const detail = tem.create(
          SaleDetail,
          {
            sale,
            book: tem.getReference(Book, line.bookId as never),
            qty: line.qty,
            price,
          },
          { partial: true },
        );
        tem.persist(detail);
      }

      // Apply stock decrements per book (summed demand).
      for (const [id, want] of demand) {
        bookById.get(id)!.stock -= want;
      }

      sale.total = total.toFixed(2);
      await tem.flush();
      return sale.saleId;
    });

    return this.findOne(saleId);
  }

  async findAll() {
    return this.listWhere({});
  }

  /** Sales belonging to a single customer (purchase history for the storefront). */
  async findAllForCustomer(cusId: number) {
    return this.listWhere({ customer: cusId });
  }

  private async listWhere(where: Record<string, any>) {
    const sales = await this.em.find(
      Sale,
      where,
      { populate: ['customer', 'employee', 'details'], orderBy: { saleId: 'DESC' } },
    );
    return sales.map((s) => ({ ...serialize(s), lineCount: s.details.length }));
  }

  async findOne(id: number) {
    const sale = await this.em.findOne(
      Sale,
      { saleId: id },
      { populate: ['customer', 'employee', 'details', 'details.book'] },
    );
    if (!sale) throw new NotFoundException('Sale not found');
    return serialize(sale);
  }

  /** A single sale scoped to its owner — used for the customer's own receipt. */
  async findOneForCustomer(cusId: number, id: number) {
    const sale = await this.em.findOne(
      Sale,
      { saleId: id, customer: { cusId } },
      { populate: ['customer', 'details', 'details.book'] },
    );
    if (!sale) throw new NotFoundException('Sale not found');
    return serialize(sale);
  }
}
