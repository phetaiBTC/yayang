# Reporting

### Requirement: Operational Reports
The system SHALL produce six reports queried from existing data, each available to an authenticated user: registration, purchase orders, imports, sales, reservations, and best-selling books.

#### Scenario: Registration report
- **WHEN** a user requests `GET /api/reports/registration`
- **THEN** the system returns the customers who registered, with a count summary

#### Scenario: Purchase order report
- **WHEN** a user requests `GET /api/reports/purchase-orders`
- **THEN** the system returns purchase orders with supplier, date, status, line count, and order total, plus a summary

#### Scenario: Import report
- **WHEN** a user requests `GET /api/reports/imports`
- **THEN** the system returns imports with their purchase order, date, and received quantities, plus a summary

#### Scenario: Sales report
- **WHEN** a user requests `GET /api/reports/sales`
- **THEN** the system returns sales with customer, date, payment method, and total, plus a revenue summary

#### Scenario: Reservation report
- **WHEN** a user requests `GET /api/reports/reservations`
- **THEN** the system returns reservations with customer, date, status, deposit, and total, plus a summary

#### Scenario: Reports require authentication
- **WHEN** a report endpoint is requested without a valid token
- **THEN** the system returns `401`

### Requirement: Date-Range Filtering
The system SHALL filter each report by an optional inclusive start and end date, returning only records whose date falls within the range.

#### Scenario: Filter by date range
- **WHEN** a user supplies `from` and `to` dates to a report
- **THEN** the system returns only records whose relevant date is within `[from, to]` inclusive

#### Scenario: Open-ended or absent range
- **WHEN** a user supplies only one bound, or none
- **THEN** the system applies only the given bound, or returns all records when no range is given

### Requirement: Best-Selling Books Report
The system SHALL rank books by total quantity sold in descending order, optionally within a sale-date range.

#### Scenario: Best-sellers ranked
- **WHEN** the best-selling report runs over `sale_details`
- **THEN** the system returns books ranked by total quantity sold, descending, each with its total quantity (and revenue)

#### Scenario: Best-sellers within a range
- **WHEN** a date range is supplied to the best-sellers report
- **THEN** only sales within that range contribute to the ranking
