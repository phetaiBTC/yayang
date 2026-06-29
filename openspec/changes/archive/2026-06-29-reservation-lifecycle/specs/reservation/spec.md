## ADDED Requirements

### Requirement: Select and Reserve Books
The system SHALL let an authenticated staff member create a reservation for a customer with one or more book lines, recorded atomically with status `booked`, without changing stock.

#### Scenario: Save reservation
- **WHEN** a user submits a customer and at least one book line with `qty` to `POST /api/reservations`
- **THEN** the system creates a `reservation` with status `booked`, persists its line items (price snapshotted from each book's current price) in one transaction, and records the creating employee from the token

#### Scenario: Reservation does not change stock
- **WHEN** a reservation is created, including for a book with zero stock
- **THEN** the system saves the reservation and leaves every `book.stock` unchanged

#### Scenario: Empty or invalid reservation rejected
- **WHEN** a reservation is submitted with no lines, or referencing a customer or book that does not exist
- **THEN** the system rejects it with an error and changes nothing

### Requirement: Deposit Payment and Bill
The system SHALL record a deposit on a reservation and expose a reservation bill with total, deposit, and balance.

#### Scenario: Deposit recorded
- **WHEN** a user submits a deposit amount to `POST /api/reservations/:id/deposit` for a booked or ready reservation
- **THEN** the system stores the deposit amount on the reservation

#### Scenario: Reservation bill
- **WHEN** a user requests `GET /api/reservations/:id`
- **THEN** the system returns the reservation with its lines, the computed `total`, the `deposit`, and the `balance` (total minus deposit)

### Requirement: Track Reservation Status
The system SHALL track reservation status through the lifecycle `booked → ready → completed | cancelled`, allowing only valid transitions, and SHALL permit marking a reservation ready only when its books are in stock.

#### Scenario: Mark ready when stock arrives
- **WHEN** a user marks a `booked` reservation `ready` and every reserved book has at least the reserved quantity in stock
- **THEN** the system sets the status to `ready`

#### Scenario: Cannot mark ready without stock
- **WHEN** a user marks a `booked` reservation `ready` but some reserved book has insufficient stock
- **THEN** the system rejects the transition with `400` and leaves the status `booked`

#### Scenario: Valid lifecycle transitions
- **WHEN** a user changes status `booked→cancelled`, `ready→completed`, or `ready→cancelled`
- **THEN** the system applies the new status

#### Scenario: Invalid transition rejected
- **WHEN** a user attempts a transition that is not allowed (e.g. `completed→ready`, `booked→completed`, or changing a terminal status)
- **THEN** the system rejects it with `400` and leaves the status unchanged
