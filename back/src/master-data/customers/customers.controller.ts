import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { serialize } from '../../common/serialize';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

// Manageable by admin + staff (no @Roles → any authenticated user).
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  async findAll() {
    return { data: serialize(await this.service.findAll()), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: serialize(await this.service.findOne(id)), message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    return { data: serialize(await this.service.create(dto)), message: 'Customer created' };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return { data: serialize(await this.service.update(id, dto)), message: 'Customer updated' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { data: null, message: 'Customer deleted' };
  }
}
