import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/current-user.decorator';
import { ImportsService } from './imports.service';
import { CreateImportDto } from './dto/create-import.dto';

// Auth required (admin + staff).
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(private readonly service: ImportsService) {}

  @Get()
  async findAll() {
    return { data: await this.service.findAll(), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.service.findOne(id), message: 'OK' };
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateImportDto) {
    return {
      data: await this.service.create(user.empId, dto),
      message: 'Import recorded',
    };
  }
}
