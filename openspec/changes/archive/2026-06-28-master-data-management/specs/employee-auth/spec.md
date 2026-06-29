## ADDED Requirements

### Requirement: Employee Login
The system SHALL allow an employee to authenticate with username and password and receive a JWT access token plus their user profile.

#### Scenario: Successful login
- **WHEN** an active employee submits a correct username and password to `POST /api/auth/login`
- **THEN** the system returns `200` with `{ data: { access_token, user: { empId, username, role } }, message }` and the token encodes `sub=empId`, `username`, and `role`

#### Scenario: Wrong password
- **WHEN** an employee submits a valid username with an incorrect password
- **THEN** the system returns `401 Unauthorized` and no token

#### Scenario: Unknown username
- **WHEN** a login is attempted with a username that does not exist
- **THEN** the system returns `401 Unauthorized` with a generic message that does not reveal whether the username exists

### Requirement: Password Security
The system SHALL store employee passwords only as bcrypt hashes and SHALL never include the password in any API response.

#### Scenario: Password is hashed on creation
- **WHEN** an employee is created with a plaintext password
- **THEN** the stored value is a bcrypt hash, not the plaintext

#### Scenario: Password never serialized
- **WHEN** any endpoint returns an employee record
- **THEN** the response contains no `password` field

### Requirement: Protected Routes Require Token
The system SHALL reject requests to protected endpoints that lack a valid JWT, and SHALL enforce role restrictions on role-gated endpoints.

#### Scenario: Missing token rejected
- **WHEN** a request to a protected endpoint is made without a valid `Authorization: Bearer` token
- **THEN** the system returns `401 Unauthorized`

#### Scenario: Insufficient role rejected
- **WHEN** a staff user calls an admin-only endpoint with a valid token
- **THEN** the system returns `403 Forbidden`

### Requirement: First Admin Seeding
The system SHALL provide an idempotent way to create the initial admin employee so that admin-gated management can be bootstrapped.

#### Scenario: Seed creates admin when none exists
- **WHEN** the admin seeder runs and no admin employee exists
- **THEN** the system creates one admin employee with a bcrypt-hashed password

#### Scenario: Seed is idempotent
- **WHEN** the admin seeder runs and an admin employee already exists
- **THEN** the system makes no changes and reports that an admin already exists
