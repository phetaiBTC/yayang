import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/current-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

// Auth required (admin + staff). Purchasing is a staff activity.
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Get()
  async findAll() {
    return { data: await this.service.findAll(), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.service.findOne(id), message: 'OK' };
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreatePurchaseOrderDto) {
    return {
      data: await this.service.create(user.empId, dto),
      message: 'Purchase order created',
    };
  }
}
