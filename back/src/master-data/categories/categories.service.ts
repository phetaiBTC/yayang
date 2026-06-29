import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Book, Category } from '../../entities';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Category, {}, { orderBy: { catId: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.em.findOne(Category, { catId: id });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const cat = this.em.create(Category, { catName: dto.catName }, { partial: true });
    await this.em.persistAndFlush(cat);
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    this.em.assign(cat, dto);
    await this.em.persistAndFlush(cat);
    return cat;
  }

  async remove(id: number) {
    const cat = await this.findOne(id);
    const inUse = await this.em.count(Book, { category: cat });
    if (inUse > 0) {
      throw new ConflictException('Cannot delete: category is in use by one or more books');
    }
    await this.em.removeAndFlush(cat);
  }
}
