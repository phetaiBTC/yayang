import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/core';
import * as bcrypt from 'bcryptjs';
import { Employee } from '../../entities';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Employee, {}, { orderBy: { empId: 'ASC' } });
  }

  async findOne(id: number) {
    const emp = await this.em.findOne(Employee, { empId: id });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    await this.assertUsernameFree(dto.username);
    const emp = this.em.create(
      Employee,
      {
        name: dto.name,
        phone: dto.phone,
        username: dto.username,
        password: await bcrypt.hash(dto.password, 10),
        role: dto.role,
      },
      { partial: true },
    );
    await this.persist(emp);
    return emp;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const emp = await this.findOne(id);
    if (dto.username && dto.username !== emp.username) {
      await this.assertUsernameFree(dto.username);
    }
    const { password, ...rest } = dto;
    this.em.assign(emp, rest);
    if (password) emp.password = await bcrypt.hash(password, 10);
    await this.persist(emp);
    return emp;
  }

  async remove(id: number) {
    const emp = await this.findOne(id);
    await this.em.removeAndFlush(emp);
  }

  private async assertUsernameFree(username: string) {
    if (await this.em.findOne(Employee, { username })) {
      throw new ConflictException('Username already exists');
    }
  }

  private async persist(emp: Employee) {
    try {
      await this.em.persistAndFlush(emp);
    } catch (err) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Username already exists');
      }
      throw err;
    }
  }
}
