import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { Customer } from './customer.entity';
import { Employee } from './employee.entity';
import { SaleDetail } from './sale-detail.entity';

@Entity({ tableName: 'sales' })
export class Sale {
  @PrimaryKey({ fieldName: 'sale_id' }) saleId!: number;
  @ManyToOne(() => Customer, { fieldName: 'cus_id' }) customer!: Customer;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'sale_date', onCreate: () => new Date() })
  saleDate = new Date();
  @Property({ type: 'decimal', precision: 12, scale: 2 }) total!: string;
  @Property({ fieldName: 'payment_method' }) paymentMethod!: string; // cash, transfer, qr

  @OneToMany(() => SaleDetail, (d) => d.sale)
  details = new Collection<SaleDetail>(this);
}
