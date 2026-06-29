import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book, Employee, Import, ImportDetail, PurchaseOrder } from '../entities';
import { serialize } from '../common/serialize';
import { CreateImportDto } from './dto/create-import.dto';

interface ReceivedLine {
  bookId: number;
  qty: number;
}

@Injectable()
export class ImportsService {
  constructor(private readonly em: EntityManager) {}

  /** Receive a pending PO into stock atomically; employee comes from the token. */
  async create(empId: number, dto: CreateImportDto) {
    const po = await this.em.findOne(
      PurchaseOrder,
      { poId: dto.poId },
      { populate: ['details', 'details.book'] },
    );
    if (!po) throw new NotFoundException('Purchase order not found');

    const orderedBookIds = new Set(po.details.getItems().map((d) => d.book.bookId));

    // Resolve received lines: explicit quantities, or default to the ordered ones.
    let received: ReceivedLine[];
    if (dto.lines && dto.lines.length) {
      for (const line of dto.lines) {
        if (!orderedBookIds.has(line.bookId)) {
          throw new BadRequestException(`Book ${line.bookId} is not part of this purchase order`);
        }
      }
      received = dto.lines.map((l) => ({ bookId: l.bookId, qty: l.qty }));
    } else {
      received = po.details.getItems().map((d) => ({ bookId: d.book.bookId, qty: d.qty }));
    }

    const importId = await this.em.transactional(async (tem) => {
      // Re-check status inside the transaction to guard against double-import.
      const lockedPo = await tem.findOne(PurchaseOrder, { poId: dto.poId });
      if (!lockedPo) throw new NotFoundException('Purchase order not found');
      if (lockedPo.status !== 'pending') {
        throw new ConflictException('Purchase order has already been imported');
      }

      const imp = tem.create(
        Import,
        {
          order: tem.getReference(PurchaseOrder, dto.poId as never),
          employee: tem.getReference(Employee, empId as never),
        },
        { partial: true },
      );
      tem.persist(imp);

      const bookIds = [...new Set(received.map((r) => r.bookId))];
      const books = await tem.find(Book, { bookId: { $in: bookIds } });
      const bookById = new Map(books.map((b) => [b.bookId, b]));

      for (const line of received) {
        const book = bookById.get(line.bookId)!;
        book.stock += line.qty; // managed entity → UoW issues UPDATE
        const detail = tem.create(
          ImportDetail,
          { import: imp, book: tem.getReference(Book, line.bookId as never), qty: line.qty },
          { partial: true },
        );
        tem.persist(detail);
      }

      lockedPo.status = 'received';
      await tem.flush();
      return imp.importId;
    });

    return this.findOne(importId);
  }

  async findAll() {
    const imports = await this.em.find(
      Import,
      {},
      { populate: ['order', 'order.supplier', 'employee', 'details'], orderBy: { importId: 'DESC' } },
    );
    return imports.map((i) => ({
      ...serialize(i),
      lineCount: i.details.length,
      totalQty: i.details.getItems().reduce((s, d) => s + d.qty, 0),
    }));
  }

  async findOne(id: number) {
    const imp = await this.em.findOne(
      Import,
      { importId: id },
      { populate: ['order', 'order.supplier', 'employee', 'details', 'details.book'] },
    );
    if (!imp) throw new NotFoundException('Import not found');
    return {
      ...serialize(imp),
      totalQty: imp.details.getItems().reduce((s, d) => s + d.qty, 0),
    };
  }
}
