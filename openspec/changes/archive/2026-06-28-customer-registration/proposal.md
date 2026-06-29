## Why

Customers currently exist only as master-data records created by staff. Section 3 of the bookstore plan calls for customer **self**-registration: a customer enters their own details, receives a one-time passcode (OTP), and confirms it before the account becomes active. Per the business rule, a customer is inactive until `otp_verified = true`. This is the gateway for customer-facing flows (reservations, sales tied to a customer) and must exist before those build on an "active customer".

## What Changes

- **Public self-registration**: `POST /api/register` (no JWT) creates — or reuses — a pending customer with `otp_verified = false` from a submitted name + phone.
- **OTP issuance**: generate a short numeric code with a short TTL, store it server-side (in-memory cache), and "send" it. Because there is no SMS gateway in this project, delivery is via server log, and the code is returned in the API response only when a dev flag is enabled — so the flow is testable end-to-end without external services.
- **OTP verification**: `POST /api/register/verify-otp` validates `{ phone, code }`; on success sets `otp_verified = true` and clears the code. Wrong/expired codes are rejected and a re-request is allowed.
- **OTP resend**: `POST /api/register/resend-otp` re-issues a fresh code for a pending customer.
- **Duplicate handling**: a verified phone re-registering is rejected (already active); an unverified phone re-registering updates the name and re-issues an OTP rather than creating a duplicate.
- **Frontend**: public `RegisterView` (name + phone) → `OtpView` (enter code, resend) → success, with a link from the login screen.

## Capabilities

### New Capabilities
- `registration`: customer self-registration with OTP issuance, verification, resend, and duplicate-phone handling.

### Modified Capabilities
<!-- None. The Customer entity already exists (otpVerified field); this change adds new behavior, not changed requirements. -->

## Impact

- **Backend** (`back/`): new `RegistrationModule` (`RegistrationController`, `RegistrationService`, `OtpService` for in-memory code storage with TTL). Reuses the existing `Customer` entity and `EntityManager`. New public routes — excluded from the JWT guard since they predate having an account.
- **Frontend** (`front/`): public `RegisterView` + `OtpView`, an `auth`/registration API module, and routes (no `requiresAuth`). A "Register" link added to `LoginView`.
- **API**: adds `POST /api/register`, `POST /api/register/verify-otp`, `POST /api/register/resend-otp`.
- **Dependencies**: none required (in-memory OTP store; no Redis/SMS). A real SMS provider and/or Redis-backed store are explicit non-goals, swappable later behind `OtpService`.
- **Data**: no schema change — operates on the existing `customers` table.
