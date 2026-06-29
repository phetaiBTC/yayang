import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Collection, EntityManager } from '@mikro-orm/core';
import { Book, Employee, PurchaseOrder, PurchaseOrderDetail, Supplier } from '../entities';
import { serialize } from '../common/serialize';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly em: EntityManager) {}

  /** Create a PO header + lines atomically. Employee comes from the token. */
  async create(empId: number, dto: CreatePurchaseOrderDto) {
    const supplier = await this.em.findOne(Supplier, { supId: dto.supId });
    if (!supplier) throw new BadRequestException(`Supplier ${dto.supId} does not exist`);

    const bookIds = [...new Set(dto.lines.map((l) => l.bookId))];
    const books = await this.em.find(Book, { bookId: { $in: bookIds } });
    const found = new Set(books.map((b) => b.bookId));
    const missing = bookIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new BadRequestException(`Unknown book(s): ${missing.join(', ')}`);
    }

    const poId = await this.em.transactional(async (tem) => {
      // Use managed references to existing rows (ids cast — these entities use
      // non-`id` primary keys, which MikroORM's getReference typing can't infer).
      const po = tem.create(
        PurchaseOrder,
        {
          supplier: tem.getReference(Supplier, dto.supId as never),
          employee: tem.getReference(Employee, empId as never),
        },
        { partial: true },
      );
      tem.persist(po);

      for (const line of dto.lines) {
        const detail = tem.create(
          PurchaseOrderDetail,
          {
            order: po,
            book: tem.getReference(Book, line.bookId as never),
            qty: line.qty,
            costPrice: String(line.costPrice),
          },
          { partial: true },
        );
        tem.persist(detail);
      }
      // flush happens at the end of the transaction
      await tem.flush();
      return po.poId;
    });

    return this.findOne(poId);
  }

  async findAll() {
    const orders = await this.em.find(
      PurchaseOrder,
      {},
      { populate: ['supplier', 'employee', 'details'], orderBy: { poId: 'DESC' } },
    );
    return orders.map((o) => ({
      ...serialize(o),
      lineCount: o.details.length,
      totalCost: this.totalCost(o.details),
    }));
  }

  async findOne(id: number) {
    const po = await this.em.findOne(
      PurchaseOrder,
      { poId: id },
      { populate: ['supplier', 'employee', 'details', 'details.book'] },
    );
    if (!po) throw new NotFoundException('Purchase order not found');
    return { ...serialize(po), totalCost: this.totalCost(po.details) };
  }

  private totalCost(details: Collection<PurchaseOrderDetail>): number {
    return details
      .getItems()
      .reduce((sum, d) => sum + d.qty * Number(d.costPrice), 0);
  }
}
