import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';

@Module({
  imports: [AuthModule], // JwtModule (for signing customer login tokens)
  controllers: [RegistrationController],
  providers: [OtpService, MailService, RegistrationService],
})
export class RegistrationModule {}
