import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/current-user.decorator';
import { ReservationsService } from './reservations.service';
import {
  CreateReservationDto,
  DepositDto,
  UpdateStatusDto,
} from './dto/reservation.dto';

// Auth required (admin + staff).
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  @Get()
  async findAll() {
    return { data: await this.service.findAll(), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.service.findOne(id), message: 'OK' };
  }

  @Post()
  async create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateReservationDto) {
    return { data: await this.service.create(user.empId, dto), message: 'Reservation created' };
  }

  @Post(':id/deposit')
  async deposit(@Param('id', ParseIntPipe) id: number, @Body() dto: DepositDto) {
    return { data: await this.service.recordDeposit(id, dto.deposit), message: 'Deposit recorded' };
  }

  @Patch(':id/status')
  async status(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return { data: await this.service.changeStatus(id, dto.status), message: 'Status updated' };
  }
}
