import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book, BookType, Category } from '../../entities';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Book, {}, { populate: ['category', 'bookType'], orderBy: { bookId: 'ASC' } });
  }

  async findOne(id: number) {
    const book = await this.em.findOne(Book, { bookId: id }, { populate: ['category', 'bookType'] });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(dto: CreateBookDto) {
    const category = await this.requireCategory(dto.catId);
    const bookType = await this.requireBookType(dto.typeId);
    // stock is intentionally omitted — the entity default (0) applies. Stock
    // only changes through import/sale transactions, never via this CRUD.
    const book = this.em.create(
      Book,
      {
        title: dto.title,
        category,
        bookType,
        price: String(dto.price),
        image: dto.image,
      },
      { partial: true },
    );
    await this.em.persistAndFlush(book);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    if (dto.title !== undefined) book.title = dto.title;
    if (dto.price !== undefined) book.price = String(dto.price);
    if (dto.image !== undefined) book.image = dto.image;
    if (dto.catId !== undefined) book.category = await this.requireCategory(dto.catId);
    if (dto.typeId !== undefined) book.bookType = await this.requireBookType(dto.typeId);
    // stock deliberately not touched here.
    await this.em.persistAndFlush(book);
    return book;
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    await this.em.removeAndFlush(book);
  }

  private async requireCategory(catId: number) {
    const category = await this.em.findOne(Category, { catId });
    if (!category) throw new BadRequestException(`Category ${catId} does not exist`);
    return category;
  }

  private async requireBookType(typeId: number) {
    const bookType = await this.em.findOne(BookType, { typeId });
    if (!bookType) throw new BadRequestException(`Book type ${typeId} does not exist`);
    return bookType;
  }
}
