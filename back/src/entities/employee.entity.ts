import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { PurchaseOrder } from './purchase-order.entity';
import { Import } from './import.entity';
import { Sale } from './sale.entity';
import { Reservation } from './reservation.entity';

@Entity({ tableName: 'employees' })
export class Employee {
  @PrimaryKey({ fieldName: 'emp_id' }) empId!: number;
  @Property() name!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ unique: true }) username!: string;
  @Property({ hidden: true }) password!: string;
  @Property() role!: string; // admin, staff

  @OneToMany(() => PurchaseOrder, (po) => po.employee)
  purchaseOrders = new Collection<PurchaseOrder>(this);
  @OneToMany(() => Import, (i) => i.employee)
  imports = new Collection<Import>(this);
  @OneToMany(() => Sale, (s) => s.employee)
  sales = new Collection<Sale>(this);
  @OneToMany(() => Reservation, (r) => r.employee)
  reservations = new Collection<Reservation>(this);
}
