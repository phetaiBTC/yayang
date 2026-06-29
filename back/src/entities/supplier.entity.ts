import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { PurchaseOrder } from './purchase-order.entity';

@Entity({ tableName: 'suppliers' })
export class Supplier {
  @PrimaryKey({ fieldName: 'sup_id' }) supId!: number;
  @Property({ fieldName: 'sup_name' }) supName!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ nullable: true }) address?: string;

  @OneToMany(() => PurchaseOrder, (po) => po.supplier)
  purchaseOrders = new Collection<PurchaseOrder>(this);
}
