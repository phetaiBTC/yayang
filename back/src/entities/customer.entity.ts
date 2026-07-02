import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Sale } from './sale.entity';
import { Reservation } from './reservation.entity';

@Entity({ tableName: 'customers' })
export class Customer {
  @PrimaryKey({ fieldName: 'cus_id' }) cusId!: number;
  @Property() name!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ nullable: true }) email?: string;
  @Property({ fieldName: 'otp_verified', default: false }) otpVerified = false;
  @Property({ fieldName: 'created_at', onCreate: () => new Date() })
  createdAt = new Date();

  @OneToMany(() => Sale, (s) => s.customer)
  sales = new Collection<Sale>(this);
  @OneToMany(() => Reservation, (r) => r.customer)
  reservations = new Collection<Reservation>(this);
}
