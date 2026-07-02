import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { JwtService } from '@nestjs/jwt';
import { Customer } from '../entities';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';
import { JwtPayload } from '../auth/jwt.strategy';
import {
  CustomerLoginRequestDto,
  CustomerLoginVerifyDto,
  RegisterDto,
  ResendOtpDto,
  VerifyOtpDto,
} from './dto/registration.dto';

export interface IssueResult {
  customer: Customer;
  code: string;
}

export interface CustomerAuthUser {
  cusId: number;
  username: string;
  role: 'customer';
}

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly otp: OtpService,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
  ) {}

  /** Issue a code under `key` and email it to `email` (mail failure is non-fatal). */
  private async issueAndSend(key: string, email: string | undefined): Promise<string> {
    const code = this.otp.issue(key);
    // A mail-delivery failure must not fail the flow (the code is already
    // issued; dev mode still echoes it). Surface the error in the logs.
    try {
      await this.mail.sendOtp(email!, code);
    } catch (e) {
      this.logger.error(`Failed to email OTP to ${email}`, e as Error);
    }
    return code;
  }

  /** OTP-login: separate key namespace so it never clashes with registration. */
  private loginKey(email: string): string {
    return `login:${email.toLowerCase()}`;
  }

  /** Create or reuse a pending customer and issue an OTP. */
  async register(dto: RegisterDto): Promise<IssueResult> {
    const existing = await this.em.findOne(Customer, { phone: dto.phone });

    if (existing) {
      if (existing.otpVerified) {
        throw new ConflictException('This phone is already registered');
      }
      // Re-register an unverified phone: update name/email, re-issue (no duplicate).
      existing.name = dto.name;
      existing.email = dto.email;
      await this.em.persistAndFlush(existing);
      return { customer: existing, code: await this.issueAndSend(existing.phone!, existing.email) };
    }

    const customer = this.em.create(
      Customer,
      { name: dto.name, phone: dto.phone, email: dto.email },
      { partial: true },
    );
    await this.em.persistAndFlush(customer);
    return { customer, code: await this.issueAndSend(customer.phone!, customer.email) };
  }

  /** Validate the OTP and activate the customer. */
  async verify(dto: VerifyOtpDto): Promise<Customer> {
    const customer = await this.requirePending(dto.phone, true);
    if (customer.otpVerified) return customer; // idempotent

    this.otp.verify(dto.phone, dto.code); // throws on any failure
    customer.otpVerified = true;
    await this.em.persistAndFlush(customer);
    return customer;
  }

  /** Re-issue a code for a pending customer and email it. */
  async resend(dto: ResendOtpDto): Promise<IssueResult> {
    const customer = await this.requirePending(dto.phone, false);
    return { customer, code: await this.issueAndSend(customer.phone!, customer.email) };
  }

  /** Customer OTP-login step 1: email a login code to a verified customer. */
  async requestLoginOtp(dto: CustomerLoginRequestDto): Promise<{ customer: Customer; code: string }> {
    const customer = await this.requireVerifiedByEmail(dto.email);
    const code = await this.issueAndSend(this.loginKey(dto.email), customer.email);
    return { customer, code };
  }

  /** Customer OTP-login step 2: verify the code and return a customer JWT. */
  async verifyLoginOtp(
    dto: CustomerLoginVerifyDto,
  ): Promise<{ access_token: string; user: CustomerAuthUser }> {
    const customer = await this.requireVerifiedByEmail(dto.email);
    this.otp.verify(this.loginKey(dto.email), dto.code); // throws on any failure

    const user: CustomerAuthUser = {
      cusId: customer.cusId,
      username: customer.name,
      role: 'customer',
    };
    const payload: JwtPayload = { sub: customer.cusId, username: customer.name, role: 'customer' };
    return { access_token: await this.jwt.signAsync(payload), user };
  }

  private async requireVerifiedByEmail(email: string): Promise<Customer> {
    const customer = await this.em.findOne(Customer, { email });
    if (!customer || !customer.otpVerified) {
      throw new BadRequestException('No verified account for this email');
    }
    return customer;
  }

  private async requirePending(phone: string, allowVerified: boolean): Promise<Customer> {
    const customer = await this.em.findOne(Customer, { phone });
    if (!customer) {
      throw new NotFoundException('No registration found for this phone');
    }
    if (!allowVerified && customer.otpVerified) {
      throw new ConflictException('This phone is already verified');
    }
    return customer;
  }
}
