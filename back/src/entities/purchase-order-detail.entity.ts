import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { PurchaseOrder } from './purchase-order.entity';
import { Book } from './book.entity';

@Entity({ tableName: 'purchase_order_details' })
export class PurchaseOrderDetail {
  @PrimaryKey({ fieldName: 'pod_id' }) podId!: number;
  @ManyToOne(() => PurchaseOrder, { fieldName: 'po_id' }) order!: PurchaseOrder;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ fieldName: 'cost_price', type: 'decimal', precision: 12, scale: 2 }) costPrice!: string;
}
