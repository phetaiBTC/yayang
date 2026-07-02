import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { serialize } from '../common/serialize';
import { Customer } from '../entities';
import { OtpService } from './otp.service';
import { RegistrationService } from './registration.service';
import {
  CustomerLoginRequestDto,
  CustomerLoginVerifyDto,
  RegisterDto,
  ResendOtpDto,
  VerifyOtpDto,
} from './dto/registration.dto';

// Public — registrants have no account yet, so no JwtAuthGuard here.
@Controller('register')
export class RegistrationController {
  constructor(
    private readonly service: RegistrationService,
    private readonly otp: OtpService,
  ) {}

  @Post()
  @HttpCode(201)
  async register(@Body() dto: RegisterDto) {
    const { customer, code } = await this.service.register(dto);
    return { data: this.withDevOtp(customer, code), message: 'OTP sent' };
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verify(@Body() dto: VerifyOtpDto) {
    const customer = await this.service.verify(dto);
    return { data: serialize(customer), message: 'Phone verified' };
  }

  @Post('resend-otp')
  @HttpCode(200)
  async resend(@Body() dto: ResendOtpDto) {
    const { customer, code } = await this.service.resend(dto);
    return { data: this.withDevOtp(customer, code), message: 'OTP resent' };
  }

  // --- Customer OTP login (passwordless) ---

  @Post('login-otp')
  @HttpCode(200)
  async loginOtp(@Body() dto: CustomerLoginRequestDto) {
    const { customer, code } = await this.service.requestLoginOtp(dto);
    return { data: this.withDevOtp(customer, code), message: 'Login OTP sent' };
  }

  @Post('login-verify')
  @HttpCode(200)
  async loginVerify(@Body() dto: CustomerLoginVerifyDto) {
    const data = await this.service.verifyLoginOtp(dto);
    return { data, message: 'Login successful' };
  }

  // Echo the code in the response only when dev mode is on (no SMS gateway).
  private withDevOtp(customer: Customer, code: string) {
    const data = serialize(customer);
    if (this.otp.isDevMode) data.devOtp = code;
    return data;
  }
}
