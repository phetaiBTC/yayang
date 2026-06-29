## ADDED Requirements

### Requirement: Employee Management
The system SHALL allow an admin to create, read, update, and delete employee records, each with a role of `admin` or `staff` and a unique username.

#### Scenario: Create employee
- **WHEN** an admin submits a valid employee with a unique username and a password
- **THEN** the system creates the record, hashes the password, and returns the new `empId`

#### Scenario: Duplicate username rejected
- **WHEN** an admin creates an employee with a username that already exists
- **THEN** the system returns `409 Conflict` and does not create the record

#### Scenario: Non-admin cannot manage employees
- **WHEN** a staff user calls any employee write endpoint
- **THEN** the system returns `403 Forbidden`

### Requirement: Category Management
The system SHALL manage book categories (ໝວດໝູ່) as a lookup table and SHALL prevent deletion of a category that is referenced by any book.

#### Scenario: Create category
- **WHEN** an admin submits a category name
- **THEN** the system creates the category and returns its `catId`

#### Scenario: Category in use cannot be deleted
- **WHEN** a user attempts to delete a category referenced by at least one book
- **THEN** the system returns `409 Conflict`, warns the user, and does not delete it

#### Scenario: Unused category deleted
- **WHEN** a user deletes a category that no book references
- **THEN** the system removes it and returns success

### Requirement: Book Type Management
The system SHALL manage book types (ປະເພດ) as a lookup table and SHALL prevent deletion of a type that is referenced by any book.

#### Scenario: Create book type
- **WHEN** an admin submits a book type name
- **THEN** the system creates the type and returns its `typeId`

#### Scenario: Book type in use cannot be deleted
- **WHEN** a user attempts to delete a book type referenced by at least one book
- **THEN** the system returns `409 Conflict` and does not delete it

### Requirement: Book Management
The system SHALL manage books with title, category, type, and price, and SHALL initialize stock to zero on creation.

#### Scenario: Create book defaults stock to zero
- **WHEN** a user creates a book referencing an existing category and type
- **THEN** the system creates the book with `stock = 0`

#### Scenario: Invalid category or type rejected
- **WHEN** a user creates a book referencing a category or type that does not exist
- **THEN** the system returns a validation error and does not create the book

#### Scenario: Stock not settable via CRUD
- **WHEN** a create or update request includes a stock value
- **THEN** the system ignores it and stock changes only through import or sale operations

### Requirement: Customer Management
The system SHALL store customer records with name, phone, and OTP verification status, manageable by admin and staff.

#### Scenario: Create customer
- **WHEN** a user submits a valid customer with a name
- **THEN** the system creates the record with `otpVerified = false` and returns its `cusId`

### Requirement: Supplier Management
The system SHALL manage suppliers (ຜູ້ສະໜອງ) with name, phone, and address, manageable by admin and staff.

#### Scenario: Create supplier
- **WHEN** a user submits a valid supplier with a name
- **THEN** the system creates the record and returns its `supId`
