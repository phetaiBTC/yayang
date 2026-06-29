import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Reservation } from './reservation.entity';
import { Book } from './book.entity';

@Entity({ tableName: 'reservation_details' })
export class ReservationDetail {
  @PrimaryKey({ fieldName: 'rd_id' }) rdId!: number;
  @ManyToOne(() => Reservation, { fieldName: 'res_id' }) reservation!: Reservation;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ type: 'decimal', precision: 12, scale: 2 }) price!: string;
}
