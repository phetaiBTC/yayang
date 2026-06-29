# Importing (ນຳປຶ້ມເຂົ້າ)

## ADDED Requirements

### Requirement: Verify Purchase Order Bill
The system SHALL let staff verify a purchase order bill (ກວດສອບໃບບິນສັ່ງຊື້ປຶ້ມ) before importing.

#### Scenario: Only pending orders importable
- **GIVEN** a purchase order with status = received
- **WHEN** staff opens it for import
- **THEN** the system warns it was already imported

### Requirement: Import Books and Update Stock
The system SHALL record imported books (ນຳເຂົ້າປຶ້ມ) and increase stock.

#### Scenario: Import increases stock
- **GIVEN** a pending purchase order
- **WHEN** staff confirms import with received quantities
- **THEN** books.stock increases by qty AND purchase_order status becomes received
