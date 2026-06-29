# Master Data

## ADDED Requirements

### Requirement: Employee Management
The system SHALL allow admin to create, read, update, and delete employee records with role-based access (admin, staff).

#### Scenario: Create employee
- **GIVEN** an admin is logged in
- **WHEN** they submit a valid employee with unique username
- **THEN** the system creates the record and returns emp_id

#### Scenario: Duplicate username rejected
- **GIVEN** a username already exists
- **WHEN** admin creates another employee with the same username
- **THEN** the system rejects with a validation error

### Requirement: Category and Type Management
The system SHALL manage book categories (ໝວດໝູ່) and book types (ປະເພດ) as independent lookup tables.

#### Scenario: Category in use cannot be deleted
- **GIVEN** a category is referenced by at least one book
- **WHEN** a user attempts to delete it
- **THEN** the system blocks deletion and warns the user

### Requirement: Book Management
The system SHALL manage books with title, category, type, price, and stock.

#### Scenario: Create book
- **GIVEN** valid category and type exist
- **WHEN** a user creates a book
- **THEN** stock defaults to 0 until imported

### Requirement: Customer Management
The system SHALL store customer records with name, phone, and OTP verification status.

### Requirement: Supplier Management
The system SHALL manage suppliers (ຜູ້ສະໜອງ) with name, phone, and address.
