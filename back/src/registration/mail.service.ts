import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

/**
 * Sends OTP codes by email over SMTP. Configured from SMTP_* env vars.
 * If SMTP_HOST is unset the service degrades gracefully (logs only), so the
 * app still runs in environments without mail configured.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? '';
  private readonly transporter: Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (!host) {
      this.transporter = null;
      this.logger.warn('SMTP_HOST not set — OTP emails will be logged, not sent');
      return;
    }
    this.transporter = createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASSWORD
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
    });
  }

  /** Deliver an OTP code to the given email address. */
  async sendOtp(email: string, code: string): Promise<void> {
    const subject = 'ລະຫັດຢືນຢັນ OTP / Your verification code';
    const text = `ລະຫັດຢືນຢັນຂອງທ່ານແມ່ນ ${code}. ລະຫັດນີ້ຈະໝົດອາຍຸໃນ 5 ນາທີ.\n\nYour verification code is ${code}. It expires in 5 minutes.`;
    const html =
      `<p>ລະຫັດຢືນຢັນຂອງທ່ານແມ່ນ <strong style="font-size:20px">${code}</strong>.</p>` +
      `<p>ລະຫັດນີ້ຈະໝົດອາຍຸໃນ 5 ນາທີ. / This code expires in 5 minutes.</p>`;

    if (!this.transporter) {
      this.logger.warn(`(mail disabled) OTP for ${email} is ${code}`);
      return;
    }

    await this.transporter.sendMail({ from: this.from, to: email, subject, text, html });
    this.logger.log(`OTP email sent to ${email}`);
  }
}
