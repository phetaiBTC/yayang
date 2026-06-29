import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { Customer } from './customer.entity';
import { Employee } from './employee.entity';
import { ReservationDetail } from './reservation-detail.entity';

@Entity({ tableName: 'reservations' })
export class Reservation {
  @PrimaryKey({ fieldName: 'res_id' }) resId!: number;
  @ManyToOne(() => Customer, { fieldName: 'cus_id' }) customer!: Customer;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'res_date', onCreate: () => new Date() })
  resDate = new Date();
  @Property({ type: 'decimal', precision: 12, scale: 2, default: 0 }) deposit = '0';
  @Property({ default: 'booked' }) status = 'booked'; // booked, ready, completed, cancelled

  @OneToMany(() => ReservationDetail, (d) => d.reservation)
  details = new Collection<ReservationDetail>(this);
}
