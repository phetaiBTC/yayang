import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/current-user.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

// Auth required (admin + staff).
@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Get()
  async findAll() {
    return { data: await this.service.findAll(), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.service.findOne(id), message: 'OK' };
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSaleDto) {
    return { data: await this.service.create(user.empId, dto), message: 'Sale recorded' };
  }
}
