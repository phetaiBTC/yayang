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
import { Roles } from '../../auth/roles.decorator';
import { serialize } from '../../common/serialize';
import { BookTypesService } from './book-types.service';
import { CreateBookTypeDto, UpdateBookTypeDto } from './dto/book-type.dto';

// Reads: admin + staff. Writes: admin only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('book-types')
export class BookTypesController {
  constructor(private readonly service: BookTypesService) {}

  @Get()
  async findAll() {
    return { data: serialize(await this.service.findAll()), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: serialize(await this.service.findOne(id)), message: 'OK' };
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateBookTypeDto) {
    return { data: serialize(await this.service.create(dto)), message: 'Book type created' };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookTypeDto) {
    return { data: serialize(await this.service.update(id, dto)), message: 'Book type updated' };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { data: null, message: 'Book type deleted' };
  }
}
