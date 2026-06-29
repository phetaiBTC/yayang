## ADDED Requirements

### Requirement: Browse Book List for Ordering
The system SHALL let an authenticated staff member review the existing book list before creating a purchase order.

#### Scenario: List books for selection
- **WHEN** an authenticated user requests the book list
- **THEN** the system returns the available books so they can be added as order lines

### Requirement: Create Purchase Order
The system SHALL allow an authenticated staff member to create a purchase order to a supplier with one or more book lines, recorded atomically with status `pending`.

#### Scenario: Save purchase order
- **WHEN** a user submits a supplier and at least one book line with `qty` and `costPrice` to `POST /api/purchase-orders`
- **THEN** the system creates a `purchase_order` with status `pending`, persists all its line items in one transaction, and records the ordering employee from the authenticated token

#### Scenario: Empty order rejected
- **WHEN** a user submits a purchase order with no book lines
- **THEN** the system rejects it with `400` and creates nothing

#### Scenario: Unknown supplier or book rejected
- **WHEN** a user submits a purchase order referencing a supplier or book that does not exist
- **THEN** the system rejects it with an error and creates nothing

#### Scenario: Ordering employee is not client-controlled
- **WHEN** a user submits a purchase order
- **THEN** the system sets `emp_id` from the authenticated user and ignores any employee identifier in the request body

### Requirement: Review Purchase Orders
The system SHALL allow an authenticated user to list purchase orders and view a single purchase order with its line items.

#### Scenario: List purchase orders
- **WHEN** a user requests `GET /api/purchase-orders`
- **THEN** the system returns each order's supplier, order date, status, and a summary of its lines

#### Scenario: View one purchase order
- **WHEN** a user requests `GET /api/purchase-orders/:id` for an existing order
- **THEN** the system returns the order with its book line items (book, qty, cost price)

#### Scenario: View a missing purchase order
- **WHEN** a user requests a purchase order id that does not exist
- **THEN** the system returns `404`
