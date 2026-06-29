import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Category } from './category.entity';
import { BookType } from './book-type.entity';

@Entity({ tableName: 'books' })
export class Book {
  @PrimaryKey({ fieldName: 'book_id' }) bookId!: number;
  @Property() title!: string;
  @ManyToOne(() => Category, { fieldName: 'cat_id' }) category!: Category;
  @ManyToOne(() => BookType, { fieldName: 'type_id' }) bookType!: BookType;
  @Property({ type: 'decimal', precision: 12, scale: 2 }) price!: string;
  @Property({ default: 0 }) stock = 0;
}
