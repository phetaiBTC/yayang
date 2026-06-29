import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { Supplier } from './supplier.entity';
import { Employee } from './employee.entity';
import { PurchaseOrderDetail } from './purchase-order-detail.entity';

@Entity({ tableName: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryKey({ fieldName: 'po_id' }) poId!: number;
  @ManyToOne(() => Supplier, { fieldName: 'sup_id' }) supplier!: Supplier;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'order_date', onCreate: () => new Date() })
  orderDate = new Date();
  @Property({ default: 'pending' }) status = 'pending'; // pending, received

  @OneToMany(() => PurchaseOrderDetail, (d) => d.order)
  details = new Collection<PurchaseOrderDetail>(this);
}
