import { Injectable } from '@nestjs/common';
import { Collection, EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  Customer,
  Import,
  ImportDetail,
  PurchaseOrder,
  PurchaseOrderDetail,
  Reservation,
  ReservationDetail,
  Sale,
} from '../entities';
import { serialize } from '../common/serialize';
import { ReportRangeDto } from './dto/report-range.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly em: EntityManager) {}

  async registration(range: ReportRangeDto) {
    const rows = await this.em.find(Customer, this.dateWhere('createdAt', range), {
      orderBy: { cusId: 'DESC' },
    });
    return { rows: serialize(rows), summary: { count: rows.length } };
  }

  async purchaseOrders(range: ReportRangeDto) {
    const orders = await this.em.find(PurchaseOrder, this.dateWhere('orderDate', range), {
      populate: ['supplier', 'employee', 'details'],
      orderBy: { poId: 'DESC' },
    });
    const rows = orders.map((o) => ({
      ...serialize(o),
      lineCount: o.details.length,
      totalCost: this.sum(o.details, (d: PurchaseOrderDetail) => d.qty * Number(d.costPrice)),
    }));
    const totalCost = rows.reduce((s, r) => s + r.totalCost, 0);
    return { rows, summary: { count: rows.length, totalCost: totalCost.toFixed(2) } };
  }

  async imports(range: ReportRangeDto) {
    const imps = await this.em.find(Import, this.dateWhere('importDate', range), {
      populate: ['order', 'order.supplier', 'employee', 'details'],
      orderBy: { importId: 'DESC' },
    });
    const rows = imps.map((i) => ({
      ...serialize(i),
      lineCount: i.details.length,
      totalQty: this.sum(i.details, (d: ImportDetail) => d.qty),
    }));
    const totalQty = rows.reduce((s, r) => s + r.totalQty, 0);
    return { rows, summary: { count: rows.length, totalQty } };
  }

  async sales(range: ReportRangeDto) {
    const sales = await this.em.find(Sale, this.dateWhere('saleDate', range), {
      populate: ['customer', 'employee', 'details'],
      orderBy: { saleId: 'DESC' },
    });
    const rows = sales.map((s) => ({ ...serialize(s), lineCount: s.details.length }));
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    return { rows, summary: { count: rows.length, totalRevenue: totalRevenue.toFixed(2) } };
  }

  async reservations(range: ReportRangeDto) {
    const res = await this.em.find(Reservation, this.dateWhere('resDate', range), {
      populate: ['customer', 'employee', 'details'],
      orderBy: { resId: 'DESC' },
    });
    const rows = res.map((r) => {
      const total = this.sum(r.details, (d: ReservationDetail) => d.qty * Number(d.price));
      return {
        ...serialize(r),
        lineCount: r.details.length,
        total: total.toFixed(2),
        balance: (total - Number(r.deposit)).toFixed(2),
      };
    });
    const totalDeposit = res.reduce((s, r) => s + Number(r.deposit), 0);
    return { rows, summary: { count: rows.length, totalDeposit: totalDeposit.toFixed(2) } };
  }

  /** Books ranked by total quantity sold, descending (grouped SQL). */
  async bestSellers(range: ReportRangeDto) {
    const where: string[] = [];
    const params: unknown[] = [];
    if (range.from) {
      where.push('s.sale_date >= ?');
      params.push(this.startOfDay(range.from));
    }
    if (range.to) {
      where.push('s.sale_date <= ?');
      params.push(this.endOfDay(range.to));
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT b.book_id AS bookId, b.title AS title,
             SUM(sd.qty) AS totalQty, SUM(sd.qty * sd.price) AS totalRevenue
      FROM sale_details sd
      JOIN books b ON b.book_id = sd.book_id
      JOIN sales s ON s.sale_id = sd.sale_id
      ${whereSql}
      GROUP BY b.book_id, b.title
      ORDER BY totalQty DESC`;
    const raw: any[] = await this.em.getConnection().execute(sql, params);
    return raw.map((r) => ({
      bookId: Number(r.bookId),
      title: r.title,
      totalQty: Number(r.totalQty),
      totalRevenue: Number(r.totalRevenue).toFixed(2),
    }));
  }

  // ----- helpers -----

  private dateWhere(field: string, range: ReportRangeDto): FilterQuery<any> {
    const cond: { $gte?: Date; $lte?: Date } = {};
    if (range.from) cond.$gte = this.startOfDay(range.from);
    if (range.to) cond.$lte = this.endOfDay(range.to);
    return Object.keys(cond).length ? ({ [field]: cond } as FilterQuery<any>) : {};
  }

  private startOfDay(date: string): Date {
    return new Date(`${date.slice(0, 10)}T00:00:00.000`);
  }
  private endOfDay(date: string): Date {
    return new Date(`${date.slice(0, 10)}T23:59:59.999`);
  }

  private sum<T extends object>(details: Collection<T>, pick: (d: T) => number): number {
    return details.getItems().reduce((s, d) => s + pick(d), 0);
  }
}
