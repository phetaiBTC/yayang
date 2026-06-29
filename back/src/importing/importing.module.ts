import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [AuthModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportingModule {}
