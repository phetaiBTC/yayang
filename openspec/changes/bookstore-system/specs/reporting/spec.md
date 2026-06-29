# Reporting (ລາຍງານ)

## ADDED Requirements

### Requirement: Operational Reports
The system SHALL produce six reports queried from existing data:
1. Registration report (ລາຍງານລົງທະບຽນ)
2. Purchase order report (ລາຍງານສັ່ງຊື້ປຶ້ມ)
3. Import report (ລາຍງານນໍາປຶ້ມເຂົ້າ)
4. Sales report (ລາຍງານຂາຍປຶ້ມ)
5. Reservation report (ລາຍງານສັ່ງຈອງປຶ້ມ)
6. Best-selling books report (ລາຍງານປຶ້ມຂາຍດີ)

#### Scenario: Filter by date range
- **GIVEN** a report with a date range
- **WHEN** a user selects start and end dates
- **THEN** the system returns only records within that range

#### Scenario: Best-sellers ranked
- **GIVEN** sale_details data
- **WHEN** the best-selling report runs
- **THEN** books are ranked by total qty sold, descending
