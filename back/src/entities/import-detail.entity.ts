import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Import } from './import.entity';
import { Book } from './book.entity';

@Entity({ tableName: 'import_details' })
export class ImportDetail {
  @PrimaryKey({ fieldName: 'imd_id' }) imdId!: number;
  @ManyToOne(() => Import, { fieldName: 'import_id' }) import!: Import;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
}
