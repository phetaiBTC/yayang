import { api } from './client';

export interface RegistrationResult {
  cusId: number;
  name: string;
  phone: string;
  otpVerified: boolean;
  /** Present only when the backend runs with OTP_DEV_MODE=true. */
  devOtp?: string;
}

export async function register(name: string, phone: string): Promise<RegistrationResult> {
  return (await api.post('/register', { name, phone })).data.data;
}

export async function verifyOtp(phone: string, code: string): Promise<RegistrationResult> {
  return (await api.post('/register/verify-otp', { phone, code })).data.data;
}

export async function resendOtp(phone: string): Promise<RegistrationResult> {
  return (await api.post('/register/resend-otp', { phone })).data.data;
}
