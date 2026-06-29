import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Customer } from '../../entities';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Customer, {}, { orderBy: { cusId: 'ASC' } });
  }

  async findOne(id: number) {
    const customer = await this.em.findOne(Customer, { cusId: id });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    // otpVerified defaults to false (entity default) — set true only via OTP flow.
    const customer = this.em.create(
      Customer,
      { name: dto.name, phone: dto.phone },
      { partial: true },
    );
    await this.em.persistAndFlush(customer);
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    this.em.assign(customer, dto);
    await this.em.persistAndFlush(customer);
    return customer;
  }

  async remove(id: number) {
    const customer = await this.findOne(id);
    await this.em.removeAndFlush(customer);
  }
}
