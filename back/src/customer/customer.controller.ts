import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CustomerAuthGuard } from '../auth';
import { CurrentUser, type CurrentUserData } from '../auth/current-user.decorator';
import { serialize } from '../common/serialize';
import { CustomerService } from './customer.service';
import { CustomerReserveDto } from './dto/customer-reserve.dto';
import { CustomerBuyDto } from './dto/customer-buy.dto';

// Storefront — customers only (CustomerAuthGuard). `user.empId` holds the JWT
// subject, which is the cusId for a customer token.
@UseGuards(CustomerAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get('books')
  async books() {
    return { data: serialize(await this.service.catalog()), message: 'OK' };
  }

  @Get('reservations')
  async myReservations(@CurrentUser() user: CurrentUserData) {
    return { data: await this.service.myReservations(user.empId), message: 'OK' };
  }

  @Post('reservations')
  @HttpCode(201)
  async reserve(@CurrentUser() user: CurrentUserData, @Body() dto: CustomerReserveDto) {
    return {
      data: await this.service.reserve(user.empId, dto.lines, dto.deposit),
      message: 'Reservation created',
    };
  }

  @Get('sales')
  async myPurchases(@CurrentUser() user: CurrentUserData) {
    return { data: await this.service.myPurchases(user.empId), message: 'OK' };
  }

  @Get('sales/:id')
  async receipt(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return { data: await this.service.receipt(user.empId, id), message: 'OK' };
  }

  @Post('sales')
  @HttpCode(201)
  async buy(@CurrentUser() user: CurrentUserData, @Body() dto: CustomerBuyDto) {
    return {
      data: await this.service.buy(user.empId, dto.paymentMethod, dto.lines),
      message: 'Purchase completed',
    };
  }
}
