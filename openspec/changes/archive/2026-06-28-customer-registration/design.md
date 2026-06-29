## Context

Sections 1–2 delivered the runnable stack and master data, including the `Customer` entity (`otpVerified` defaults to `false`, `createdAt` on insert) and a global JWT guard pattern. The bookstore plan's Section 3 needs customer self-registration with OTP. There is no SMS provider or Redis in this project, and adding them is out of scope. The design must therefore deliver a fully testable OTP flow using only what is already installed, while keeping the delivery/storage mechanism swappable. Source of truth: the `registration` capability spec in this change and CLAUDE.md ("Customer is inactive until `otp_verified = true`").

## Goals / Non-Goals

**Goals:**
- Public (unauthenticated) registration that creates/reuses a pending customer with `otpVerified = false`.
- OTP generation, server-side storage with TTL + attempt cap, verification, and resend.
- An end-to-end-testable flow without external services (log the code; optionally return it in dev).
- Idempotent duplicate-phone handling that never creates duplicate pending customers.
- Public `RegisterView` → `OtpView` front-end flow.

**Non-Goals:**
- Real SMS/email delivery (left behind the `OtpService` seam).
- Redis or any persistent/distributed OTP store (in-memory is acceptable for single-instance dev).
- Customer login/JWT issuance (customers authenticate elsewhere; this change only activates the account).
- Rate limiting beyond a simple per-code attempt cap and resend cooldown.

## Decisions

- **OTP storage = in-memory `OtpService` keyed by phone.** A `Map<phone, { code, expiresAt, attempts }>` inside an injectable singleton. Chosen over Redis/DB to avoid new infrastructure; the service interface (`issue(phone)`, `verify(phone, code)`) is the seam where a Redis or SMS-backed implementation can be dropped in later. Trade-off: codes are lost on restart and not shared across instances — acceptable for this project's scope.
- **Code format + TTL.** 6-digit numeric, 5-minute TTL, max 5 verify attempts per issued code. Generated with `crypto.randomInt` (not `Math.random`) for unbiased digits.
- **Delivery = log + dev-echo.** The code is always logged via Nest `Logger`. When `OTP_DEV_MODE=true` (default in dev), `POST /api/register` and `resend-otp` include `devOtp` in the response so the flow can be exercised without SMS. In production the flag is off and `devOtp` is omitted. Alternative (mock SMS queue) rejected as over-engineering for now.
- **Public routes.** The registration controller is **not** behind `JwtAuthGuard` — registrants have no account yet. Because Section 1 applies guards per-controller (not globally), simply omitting `@UseGuards` keeps these endpoints open.
- **Duplicate-phone policy.** On `register`: if a customer with the phone exists and is **verified** → `409 Conflict` ("already registered"); if exists but **unverified** → update the name and re-issue an OTP (treat as resend); otherwise create new. This keeps the `customers` table clean without adding a unique constraint (the schema has none, and reservations/sales may legitimately reference historical records).
- **Verify semantics.** `verify-otp` needs `{ phone, code }`. Failure modes return `400 BadRequest` with distinct messages: no pending code, expired, too many attempts, or mismatch — each leaving the customer free to resend. On success: set `otpVerified = true`, flush, and delete the stored code.
- **Response envelope** stays `{ data, message }` consistent with Section 2.

## Risks / Trade-offs

- **In-memory store lost on restart / not multi-instance** → mitigated by documenting it as dev-scope and isolating behind `OtpService`; production swap is a single class.
- **Dev-echo leaks the OTP in responses** → gated strictly by `OTP_DEV_MODE`; defaults must be off in production `.env`. Logged as a warning when enabled.
- **No global rate limit on `register`/`resend`** → abuse could spam OTP generation; mitigated with a short resend cooldown (e.g. 30s) per phone and the attempt cap. A global throttler can be added later.
- **No phone-format validation beyond presence** → kept permissive (Lao numbers vary); can tighten with a regex without a spec change.
- **Customer with same phone re-registering while unverified overwrites name** → intended (latest intent wins); acceptable because the account is not yet active.
