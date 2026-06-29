## ADDED Requirements

### Requirement: Verify Purchase Order Before Import
The system SHALL let an authenticated staff member review a purchase order's lines before importing and SHALL prevent importing an order that is not pending.

#### Scenario: Review a pending order
- **WHEN** a user opens a `pending` purchase order for import
- **THEN** the system shows its supplier and book lines so received quantities can be confirmed

#### Scenario: Already-imported order is blocked
- **WHEN** a user attempts to import a purchase order whose status is `received`
- **THEN** the system rejects the import with `409` and changes nothing

#### Scenario: Unknown order is rejected
- **WHEN** a user attempts to import a purchase order id that does not exist
- **THEN** the system returns `404`

### Requirement: Import Books and Increase Stock
The system SHALL record imported books for a pending purchase order, increase each book's stock by the received quantity, and mark the purchase order as received, all atomically.

#### Scenario: Import increases stock and closes the order
- **WHEN** a user confirms an import for a pending purchase order with received quantities
- **THEN** the system creates an import record with its line items, increases each `book.stock` by the received quantity, and sets the purchase order status to `received`

#### Scenario: Default to ordered quantities
- **WHEN** a user confirms an import without specifying received quantities
- **THEN** the system imports each ordered line at its ordered quantity

#### Scenario: Atomic failure
- **WHEN** any part of the import fails
- **THEN** no stock change, import record, or status change is persisted

#### Scenario: Received line must belong to the order
- **WHEN** an import specifies a book that is not part of the purchase order
- **THEN** the system rejects the import with `400` and changes nothing

### Requirement: Review Imports
The system SHALL allow an authenticated user to list imports and view a single import with its line items.

#### Scenario: List imports
- **WHEN** a user requests `GET /api/imports`
- **THEN** the system returns each import's purchase order, date, and a summary of received lines

#### Scenario: View one import
- **WHEN** a user requests `GET /api/imports/:id` for an existing import
- **THEN** the system returns the import with its book line items and received quantities
