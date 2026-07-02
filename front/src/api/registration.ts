import { api } from './client';

export interface RegistrationResult {
  cusId: number;
  name: string;
  phone: string;
  email?: string;
  otpVerified: boolean;
  /** Present only when the backend runs with OTP_DEV_MODE=true. */
  devOtp?: string;
}

export async function register(
  name: string,
  phone: string,
  email: string,
): Promise<RegistrationResult> {
  return (await api.post('/register', { name, phone, email })).data.data;
}

export async function verifyOtp(phone: string, code: string): Promise<RegistrationResult> {
  return (await api.post('/register/verify-otp', { phone, code })).data.data;
}

export async function resendOtp(phone: string): Promise<RegistrationResult> {
  return (await api.post('/register/resend-otp', { phone })).data.data;
}

// --- Customer OTP login (passwordless) ---

export interface CustomerLoginResult {
  access_token: string;
  user: { cusId: number; username: string; role: 'customer' };
}

/** Step 1: request a login code sent to the customer's email. */
export async function requestCustomerLoginOtp(email: string): Promise<{ devOtp?: string }> {
  return (await api.post('/register/login-otp', { email })).data.data;
}

/** Step 2: verify the code and receive a customer session token. */
export async function verifyCustomerLoginOtp(
  email: string,
  code: string,
): Promise<CustomerLoginResult> {
  return (await api.post('/register/login-verify', { email, code })).data.data;
}
