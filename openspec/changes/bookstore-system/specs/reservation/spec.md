# Reservation (ສັ່ງຈອງປຶ້ມ)

## ADDED Requirements

### Requirement: Select and Reserve Books
The system SHALL let a customer select books (ເລືອກປຶ້ມ) and create a reservation (ຈອງປຶ້ມ).

#### Scenario: Save reservation
- **GIVEN** selected books and a customer
- **WHEN** the reservation is saved (ບັນທຶກຂໍ້ມູນການຈອງ)
- **THEN** the system creates a reservation with status = booked

### Requirement: Deposit Payment and Bill
The system SHALL collect a deposit (ຊໍາລະເງິນມັດຈຳ) and issue a reservation bill (ອອກໃບບິນການຈອງ).

#### Scenario: Deposit recorded
- **GIVEN** a booked reservation
- **WHEN** the customer pays a deposit
- **THEN** the deposit amount is stored on the reservation

### Requirement: Track Reservation Status
The system SHALL allow tracking reservation status (ຕິດຕາມສະຖານະການຈອງ): booked → ready → completed / cancelled.

#### Scenario: Mark ready when stock arrives
- **GIVEN** a booked reservation for a book that was out of stock
- **WHEN** that book is imported into stock
- **THEN** the reservation can be marked ready for pickup
