import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationModule {}
