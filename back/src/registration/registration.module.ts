import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';

@Module({
  controllers: [RegistrationController],
  providers: [OtpService, RegistrationService],
})
export class RegistrationModule {}
