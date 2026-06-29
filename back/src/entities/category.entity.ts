import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Book } from './book.entity';

@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey({ fieldName: 'cat_id' }) catId!: number;
  @Property({ fieldName: 'cat_name' }) catName!: string;

  @OneToMany(() => Book, (b) => b.category)
  books = new Collection<Book>(this);
}
