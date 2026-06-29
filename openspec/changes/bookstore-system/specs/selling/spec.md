# Selling (ຂາຍປຶ້ມ)

## ADDED Requirements

### Requirement: Select Books to Sell
The system SHALL let staff select book lines for a sale (ເລືອກລາຍການປຶ້ມ).

#### Scenario: Out of stock blocked
- **GIVEN** a book with stock = 0
- **WHEN** staff adds it to a sale
- **THEN** the system prevents adding beyond available stock

### Requirement: Payment and Record Sale
The system SHALL process payment (ຊໍາລະເງິນ) and save the sale (ບັນທຶກ), decreasing stock.

#### Scenario: Complete sale
- **GIVEN** a sale with valid lines and a payment method
- **WHEN** staff confirms payment
- **THEN** the system saves the sale, computes total, AND decreases books.stock by qty
