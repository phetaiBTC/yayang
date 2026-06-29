## ADDED Requirements

### Requirement: Select Books to Sell with Stock Limit
The system SHALL let an authenticated staff member add book lines to a sale and SHALL prevent selling more than the available stock.

#### Scenario: Out of stock blocked
- **WHEN** a sale line requests a quantity greater than the book's available stock (summed across lines for the same book)
- **THEN** the system rejects the sale with `400` and changes nothing

#### Scenario: Empty sale rejected
- **WHEN** a sale is submitted with no book lines
- **THEN** the system rejects it with `400` and changes nothing

#### Scenario: Unknown customer or book rejected
- **WHEN** a sale references a customer or book that does not exist
- **THEN** the system rejects it with an error and changes nothing

### Requirement: Payment and Record Sale
The system SHALL record a sale with a payment method, compute its total from current book prices, and decrease stock, all atomically.

#### Scenario: Complete sale
- **WHEN** a staff member confirms a sale with valid lines and a payment method (`cash`, `transfer`, or `qr`)
- **THEN** the system saves the sale with its line items, computes the total from each book's price, decreases each `book.stock` by the sold quantity, and records the selling employee from the token

#### Scenario: Server-controlled price and total
- **WHEN** a sale is recorded
- **THEN** each line's unit price is taken from the book's current price and the total is the sum of line quantities times those prices, regardless of any price in the request body

#### Scenario: Atomic failure
- **WHEN** any part of the sale fails (including a stock shortfall)
- **THEN** no sale, line item, or stock change is persisted

### Requirement: Review Sales
The system SHALL allow an authenticated user to list sales and view a single sale with its line items.

#### Scenario: List sales
- **WHEN** a user requests `GET /api/sales`
- **THEN** the system returns each sale's customer, date, payment method, total, and a summary of its lines

#### Scenario: View one sale
- **WHEN** a user requests `GET /api/sales/:id` for an existing sale
- **THEN** the system returns the sale with its book line items (book, qty, price)

#### Scenario: View a missing sale
- **WHEN** a user requests a sale id that does not exist
- **THEN** the system returns `404`
