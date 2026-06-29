import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book, BookType } from '../../entities';
import { CreateBookTypeDto, UpdateBookTypeDto } from './dto/book-type.dto';

@Injectable()
export class BookTypesService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(BookType, {}, { orderBy: { typeId: 'ASC' } });
  }

  async findOne(id: number) {
    const type = await this.em.findOne(BookType, { typeId: id });
    if (!type) throw new NotFoundException('Book type not found');
    return type;
  }

  async create(dto: CreateBookTypeDto) {
    const type = this.em.create(BookType, { typeName: dto.typeName }, { partial: true });
    await this.em.persistAndFlush(type);
    return type;
  }

  async update(id: number, dto: UpdateBookTypeDto) {
    const type = await this.findOne(id);
    this.em.assign(type, dto);
    await this.em.persistAndFlush(type);
    return type;
  }

  async remove(id: number) {
    const type = await this.findOne(id);
    const inUse = await this.em.count(Book, { bookType: type });
    if (inUse > 0) {
      throw new ConflictException('Cannot delete: book type is in use by one or more books');
    }
    await this.em.removeAndFlush(type);
  }
}
