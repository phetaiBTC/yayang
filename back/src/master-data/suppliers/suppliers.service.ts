import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Supplier } from '../../entities';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Supplier, {}, { orderBy: { supId: 'ASC' } });
  }

  async findOne(id: number) {
    const supplier = await this.em.findOne(Supplier, { supId: id });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const supplier = this.em.create(
      Supplier,
      {
        supName: dto.supName,
        phone: dto.phone,
        address: dto.address,
      },
      { partial: true },
    );
    await this.em.persistAndFlush(supplier);
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    this.em.assign(supplier, dto);
    await this.em.persistAndFlush(supplier);
    return supplier;
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.em.removeAndFlush(supplier);
  }
}
