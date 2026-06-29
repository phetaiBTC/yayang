import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  lastIssuedAt: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

/**
 * In-memory OTP store keyed by phone. This is the swap seam for a future
 * Redis/SMS-backed implementation — registration code depends only on
 * `issue()` / `verify()`.
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly store = new Map<string, OtpEntry>();
  private readonly devMode = process.env.OTP_DEV_MODE === 'true';

  /** Generate and store a fresh code for the phone. Returns the code. */
  issue(phone: string): string {
    const existing = this.store.get(phone);
    const now = Date.now();
    if (existing && now - existing.lastIssuedAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastIssuedAt)) / 1000);
      throw new BadRequestException(`Please wait ${wait}s before requesting another code`);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    this.store.set(phone, { code, expiresAt: now + TTL_MS, attempts: 0, lastIssuedAt: now });

    if (this.devMode) {
      this.logger.warn(`OTP_DEV_MODE on — OTP for ${phone} is ${code}`);
    } else {
      this.logger.log(`Issued OTP for ${phone} (expires in ${TTL_MS / 1000}s)`);
    }
    return code;
  }

  /** Validate a submitted code; throws BadRequestException on any failure. */
  verify(phone: string, code: string): void {
    const entry = this.store.get(phone);
    if (!entry) {
      throw new BadRequestException('No active code for this phone — request a new one');
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(phone);
      throw new BadRequestException('Code has expired — request a new one');
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      this.store.delete(phone);
      throw new BadRequestException('Too many attempts — request a new code');
    }
    if (entry.code !== code) {
      entry.attempts += 1;
      throw new BadRequestException('Incorrect code');
    }
    // Success — single-use.
    this.store.delete(phone);
  }

  /** Whether dev-echo of the code in API responses is enabled. */
  get isDevMode(): boolean {
    return this.devMode;
  }
}
