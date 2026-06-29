## 1. OTP Service (backend)

- [x] 1.1 Create `OtpService` with in-memory `Map<phone, { code, expiresAt, attempts }>`
- [x] 1.2 `issue(phone)` — 6-digit `crypto.randomInt` code, 5-min TTL, reset attempts; return code
- [x] 1.3 `verify(phone, code)` — distinct failures: none/expired/too-many-attempts/mismatch; clear on success
- [x] 1.4 Add resend cooldown (30s) guard in `issue`
- [x] 1.5 Log the code via Nest `Logger`; read `OTP_DEV_MODE` flag

## 2. Registration Service & Controller (backend)

- [x] 2.1 `RegisterDto` (name, phone) and `VerifyOtpDto` / `ResendOtpDto` (phone[, code]) with class-validator
- [x] 2.2 `RegistrationService.register()` — duplicate-phone policy (verified→409, unverified→update+reissue, else create with `otpVerified=false`) + issue OTP
- [x] 2.3 `RegistrationService.verify()` — validate via `OtpService`, set `otpVerified=true`, flush, clear code
- [x] 2.4 `RegistrationService.resend()` — re-issue for a pending customer (404 if no pending customer / 409 if already verified)
- [x] 2.5 `RegistrationController` — public `POST /api/register`, `/register/verify-otp`, `/register/resend-otp` (no JWT guard)
- [x] 2.6 Include `devOtp` in register/resend responses only when `OTP_DEV_MODE=true`
- [x] 2.7 `RegistrationModule` + import into `AppModule`; add `OTP_DEV_MODE` to `.env`/`.env.example`

## 3. Frontend — Registration Flow

- [x] 3.1 Registration API module (`register`, `verifyOtp`, `resendOtp`)
- [x] 3.2 `RegisterView` — name + phone form → on success go to OTP step (carry phone via route query)
- [x] 3.3 `OtpView` — InputOtp code input, verify, resend button (+ devOtp hint via Message when present)
- [x] 3.4 Public routes (no `requiresAuth`) + "Register" link on `LoginView`; success → redirect to login

## 4. Verification

- [x] 4.1 Register new phone → pending customer created, `otpVerified=false`, OTP issued (verified live)
- [x] 4.2 Verify correct code → `otpVerified=true`; wrong code → `400`; too-many → `400` + resend works (all live). NOTE: 5-min expiry is logic-verified only (impractical to time live)
- [x] 4.3 Duplicate phone: verified→`409`, unverified→updates + reissues, single DB row (verified live, incl. reissue after cooldown)
- [x] 4.4 Endpoints reachable without JWT; backend typecheck + frontend typecheck/build pass; boxes ticked
