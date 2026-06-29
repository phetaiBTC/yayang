# Purchasing (ສັ່ງຊື້ປຶ້ມ)

## ADDED Requirements

### Requirement: Browse Book List
The system SHALL let staff review the book list (ກວດສອບລາຍການປຶ້ມ) before ordering.

### Requirement: Create Purchase Order
The system SHALL allow staff to create a purchase order to a supplier with one or more book lines (ສັ່ງຊື້ປຶ້ມ).

#### Scenario: Save purchase order
- **GIVEN** a supplier and at least one book line with qty and cost_price
- **WHEN** staff saves the order (ບັນທຶກສັ່ງຊື້ປຶ້ມ)
- **THEN** the system creates a purchase_order with status = pending

#### Scenario: Empty order rejected
- **GIVEN** a purchase order with no book lines
- **WHEN** staff tries to save
- **THEN** the system rejects the order
