# Registration

## ADDED Requirements

### Requirement: Customer Self-Registration
The system SHALL allow a customer to register by entering personal data (ປ້ອນຂໍ້ມູນສ່ວນຕົວ).

#### Scenario: Submit personal data
- **GIVEN** a new customer on the registration form
- **WHEN** they submit name and phone
- **THEN** the system creates a pending customer with otp_verified = false

### Requirement: OTP Verification
The system SHALL send an OTP and require verification (ຮັບລະຫັດ OTP) before the account is active.

#### Scenario: Correct OTP
- **GIVEN** a pending customer received an OTP
- **WHEN** they submit the correct OTP within the valid window
- **THEN** otp_verified is set to true

#### Scenario: Expired or wrong OTP
- **GIVEN** an OTP has expired or is incorrect
- **WHEN** the customer submits it
- **THEN** the system rejects and allows re-request
