import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Sale } from './sale.entity';
import { Book } from './book.entity';

@Entity({ tableName: 'sale_details' })
export class SaleDetail {
  @PrimaryKey({ fieldName: 'sd_id' }) sdId!: number;
  @ManyToOne(() => Sale, { fieldName: 'sale_id' }) sale!: Sale;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ type: 'decimal', precision: 12, scale: 2 }) price!: string;
}
