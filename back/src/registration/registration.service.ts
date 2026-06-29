import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Customer } from '../entities';
import { OtpService } from './otp.service';
import { RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto/registration.dto';

export interface IssueResult {
  customer: Customer;
  code: string;
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly em: EntityManager,
    private readonly otp: OtpService,
  ) {}

  /** Create or reuse a pending customer and issue an OTP. */
  async register(dto: RegisterDto): Promise<IssueResult> {
    const existing = await this.em.findOne(Customer, { phone: dto.phone });

    if (existing) {
      if (existing.otpVerified) {
        throw new ConflictException('This phone is already registered');
      }
      // Re-register an unverified phone: update name, re-issue (no duplicate).
      existing.name = dto.name;
      await this.em.persistAndFlush(existing);
      return { customer: existing, code: this.otp.issue(dto.phone) };
    }

    const customer = this.em.create(
      Customer,
      { name: dto.name, phone: dto.phone },
      { partial: true },
    );
    await this.em.persistAndFlush(customer);
    return { customer, code: this.otp.issue(dto.phone) };
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

  /** Re-issue a code for a pending customer. */
  async resend(dto: ResendOtpDto): Promise<IssueResult> {
    const customer = await this.requirePending(dto.phone, false);
    return { customer, code: this.otp.issue(dto.phone) };
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
