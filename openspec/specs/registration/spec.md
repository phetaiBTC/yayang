# Registration

### Requirement: Customer Self-Registration
The system SHALL allow a customer to register themselves by submitting personal data, creating a pending account that is inactive until OTP verification.

#### Scenario: Submit personal data
- **WHEN** a new customer submits a name and phone to `POST /api/register`
- **THEN** the system creates a pending customer with `otpVerified = false` and issues an OTP

#### Scenario: Re-register an unverified phone
- **WHEN** a customer submits `POST /api/register` with a phone that already belongs to an unverified customer
- **THEN** the system updates that customer's name, re-issues an OTP, and does not create a duplicate record

#### Scenario: Re-register an already-verified phone
- **WHEN** a customer submits `POST /api/register` with a phone that already belongs to a verified customer
- **THEN** the system returns `409 Conflict` indicating the phone is already registered

### Requirement: OTP Issuance
The system SHALL generate a time-limited one-time passcode for a pending customer and deliver it, without requiring authentication to request it.

#### Scenario: OTP generated on registration
- **WHEN** a customer successfully registers
- **THEN** the system generates a numeric code with a limited validity window, stores it server-side, and logs/sends it

#### Scenario: Resend OTP
- **WHEN** a pending customer requests `POST /api/register/resend-otp` with their phone
- **THEN** the system issues a fresh code, invalidating the previous one

#### Scenario: Registration endpoints are public
- **WHEN** an unauthenticated client calls `POST /api/register`, `verify-otp`, or `resend-otp`
- **THEN** the system processes the request without requiring a JWT

### Requirement: OTP Verification
The system SHALL require a correct, unexpired OTP before marking a customer active, and SHALL allow re-request after failure.

#### Scenario: Correct OTP within window
- **WHEN** a pending customer submits the correct code to `POST /api/register/verify-otp` within the validity window
- **THEN** the system sets `otpVerified = true` and clears the stored code

#### Scenario: Wrong OTP
- **WHEN** a customer submits an incorrect code
- **THEN** the system returns `400` and leaves the account pending, allowing another attempt or a resend

#### Scenario: Expired OTP
- **WHEN** a customer submits a code after its validity window has passed
- **THEN** the system returns `400` and allows the customer to request a new code

#### Scenario: Too many attempts
- **WHEN** a customer exceeds the allowed number of verification attempts for a code
- **THEN** the system rejects further attempts on that code and requires a resend
