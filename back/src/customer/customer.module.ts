import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { ReservationModule } from '../reservation/reservation.module';
import { SellingModule } from '../selling/selling.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [AuthModule, ReservationModule, SellingModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
