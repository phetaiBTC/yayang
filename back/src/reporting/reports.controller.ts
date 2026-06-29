import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportRangeDto } from './dto/report-range.dto';

// All reports are read-only and require authentication (admin + staff).
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('registration')
  async registration(@Query() range: ReportRangeDto) {
    return { data: await this.service.registration(range), message: 'OK' };
  }

  @Get('purchase-orders')
  async purchaseOrders(@Query() range: ReportRangeDto) {
    return { data: await this.service.purchaseOrders(range), message: 'OK' };
  }

  @Get('imports')
  async imports(@Query() range: ReportRangeDto) {
    return { data: await this.service.imports(range), message: 'OK' };
  }

  @Get('sales')
  async sales(@Query() range: ReportRangeDto) {
    return { data: await this.service.sales(range), message: 'OK' };
  }

  @Get('reservations')
  async reservations(@Query() range: ReportRangeDto) {
    return { data: await this.service.reservations(range), message: 'OK' };
  }

  @Get('best-sellers')
  async bestSellers(@Query() range: ReportRangeDto) {
    return { data: await this.service.bestSellers(range), message: 'OK' };
  }
}
