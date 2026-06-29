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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

// Reads: admin + staff. Writes: admin only.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

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
  async create(@Body() dto: CreateCategoryDto) {
    return { data: serialize(await this.service.create(dto)), message: 'Category created' };
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return { data: serialize(await this.service.update(id, dto)), message: 'Category updated' };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { data: null, message: 'Category deleted' };
  }
}
