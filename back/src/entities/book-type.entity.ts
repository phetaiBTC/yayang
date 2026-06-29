import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Book } from './book.entity';

@Entity({ tableName: 'book_types' })
export class BookType {
  @PrimaryKey({ fieldName: 'type_id' }) typeId!: number;
  @Property({ fieldName: 'type_name' }) typeName!: string;

  @OneToMany(() => Book, (b) => b.bookType)
  books = new Collection<Book>(this);
}
