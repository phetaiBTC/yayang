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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

// Manageable by admin + staff (no @Roles → any authenticated user).
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  async findAll() {
    return { data: serialize(await this.service.findAll()), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: serialize(await this.service.findOne(id)), message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    return { data: serialize(await this.service.create(dto)), message: 'Supplier created' };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return { data: serialize(await this.service.update(id, dto)), message: 'Supplier updated' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { data: null, message: 'Supplier deleted' };
  }
}
