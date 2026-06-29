## Why

Customers want to reserve books — often ones that are currently out of stock — pay a deposit, and pick them up once the shop imports them. Section 7 builds that flow: create a reservation (`booked`), record a deposit, issue a bill, and track the status lifecycle `booked → ready → completed | cancelled`, where a reservation becomes ready-eligible once its books are in stock. This is the last transactional flow and the one that ties Importing back to customer demand.

## What Changes

- **Create reservation**: `POST /api/reservations` accepts a customer + a non-empty `lines[]` (book + qty) and saves a `reservation` (status `booked`) with `reservation_details`, atomically. Line prices are snapshotted from each book's current price.
- **No stock mutation on booking**: reservations may be placed for out-of-stock books; booking does not change `book.stock` (consistent with the design's stock logic, where only import/sale move stock).
- **Record deposit**: `POST /api/reservations/:id/deposit` stores a deposit amount on the reservation.
- **Reservation bill**: `GET /api/reservations/:id` returns the reservation with its lines, computed `total`, `deposit`, and `balance` (total − deposit).
- **Status lifecycle**: `PATCH /api/reservations/:id/status` enforces the transitions `booked → ready`, `booked → cancelled`, `ready → completed`, `ready → cancelled`; anything else is rejected.
- **Ready when stock arrives**: a `booked → ready` transition is allowed only when every reserved book has enough stock (i.e. it has since been imported); the list flags which booked reservations are ready-eligible.
- **Frontend**: a Reservation view — create a reservation, record a deposit, view the bill, and advance/track status with ready-eligibility shown.

## Capabilities

### New Capabilities
- `reservation`: customer book reservations with header+lines, deposit, bill, and a `booked → ready → completed | cancelled` status lifecycle gated on stock availability.

### Modified Capabilities
<!-- None. Reuses existing Reservation/ReservationDetail/Book/Customer/Employee entities; no existing requirement changes. -->

## Impact

- **Backend** (`back/`): new `ReservationModule` (`ReservationsController`, `ReservationsService`). Header+lines create wrapped in `em.transactional()`. Reuses `Reservation` / `ReservationDetail` / `Book` / `Customer` / `Employee` entities, `@CurrentUser()`, `serialize()`, `{ data, message }`.
- **Frontend** (`front/`): new `ReservationsView` (create + line editor, deposit dialog, bill view, status actions with ready-eligibility) + reservations API module; route + menu + dashboard tile (auth-gated). Reuses `booksApi` / `customersApi`.
- **API**: adds `POST /api/reservations`, `GET /api/reservations`, `GET /api/reservations/:id`, `POST /api/reservations/:id/deposit`, `PATCH /api/reservations/:id/status`.
- **Dependencies**: none new.
- **Data**: no schema change — uses `reservations` / `reservation_details` (decimal money already scale 2). Reservations never write `book.stock`.

## Open Question

- **Pickup at completion**: the design's stock logic only moves stock on import/sale, so this change keeps `completed` as pure lifecycle tracking — it does **not** decrement stock or auto-create a sale. If the business wants pickup to consume stock (or generate a sale), that's a follow-up change. Proceeding with the spec-faithful default.
