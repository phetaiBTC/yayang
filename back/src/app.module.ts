import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './auth';
import { MasterDataModule } from './master-data/master-data.module';
import { RegistrationModule } from './registration/registration.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { ImportingModule } from './importing/importing.module';
import { SellingModule } from './selling/selling.module';
import { ReservationModule } from './reservation/reservation.module';
import { ReportingModule } from './reporting/reporting.module';
import { CustomerModule } from './customer/customer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    MasterDataModule,
    RegistrationModule,
    PurchasingModule,
    ImportingModule,
    SellingModule,
    ReservationModule,
    ReportingModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
