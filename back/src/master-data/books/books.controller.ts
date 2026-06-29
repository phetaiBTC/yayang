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
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

// Reads: admin + staff. Writes: admin only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

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
  async create(@Body() dto: CreateBookDto) {
    return { data: serialize(await this.service.create(dto)), message: 'Book created' };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto) {
    return { data: serialize(await this.service.update(id, dto)), message: 'Book updated' };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { data: null, message: 'Book deleted' };
  }
}
