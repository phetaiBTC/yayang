## 1. Reservation — DTOs & Service (backend)

- [x] 1.1 `CreateReservationLineDto` (bookId, qty ≥1) + `CreateReservationDto` (cusId, lines[] `@ValidateNested`/`@Type` + `@ArrayMinSize(1)`); `DepositDto` (deposit ≥0); `UpdateStatusDto` (`@IsIn(ready|completed|cancelled)`)
- [x] 1.2 `ReservationsService.create(empId, dto)` — validate customer + books (`400`); in `em.transactional()` create `Reservation` (status `booked`) + details with `price = book.price`; NO stock change
- [x] 1.3 `recordDeposit(id, deposit)` — set deposit on a `booked`/`ready` reservation (else `400`); `404` if missing
- [x] 1.4 `changeStatus(id, status)` — whitelist transitions (`booked→ready|cancelled`, `ready→completed|cancelled`), else `400`
- [x] 1.5 `booked→ready` gated on stock — every line `book.stock >= qty` (else `400` listing short books)
- [x] 1.6 `findAll()` — populated; compute `total`, `balance`, `lineCount`, and `readyEligible` (booked + all in stock)
- [x] 1.7 `findOne(id)` — bill: lines + `details.book`, `total`, `deposit`, `balance`; `404` when missing

## 2. Reservation — Controller & Module (backend)

- [x] 2.1 `ReservationsController` — `POST /` (`@CurrentUser()`), `GET /`, `GET /:id`, `POST /:id/deposit`, `PATCH /:id/status` under `JwtAuthGuard`
- [x] 2.2 `{ data, message }` envelope via `serialize()`
- [x] 2.3 `ReservationModule` + import into `AppModule`

## 3. Frontend — Reservation

- [x] 3.1 reservations API module (`list`, `get`, `create`, `deposit`, `setStatus`)
- [x] 3.2 `ReservationsView` — list (customer, date, status Tag, deposit, total, balance, ready-eligible badge) + "New reservation"
- [x] 3.3 Create dialog — customer Select + line editor (book Select, qty); reuses `booksApi`/`customersApi`
- [x] 3.4 Row actions — record deposit (dialog), mark ready (disabled unless eligible), complete, cancel; status-appropriate buttons
- [x] 3.5 Toast + refresh; route + menu entry + dashboard tile (auth-gated)

## 4. Verification

- [x] 4.1 Create reservation (zero-stock book) → `booked`, lines saved, stock unchanged (0), price snapshot, emp from token ✓
- [x] 4.2 Record deposit (15) → stored; bill returns total 40 / deposit 15 / balance 25 ✓
- [x] 4.3 `booked→ready` blocked when stock 0 (`400`); after importing 5 → `readyEligible=true` and `booked→ready` succeeds ✓
- [x] 4.4 `ready→completed`, `booked→cancelled` succeed; invalid (`booked→completed`, `completed→ready`, deposit on completed) → `400` ✓
- [x] 4.5 Empty lines / unknown customer / unknown book → `400`; missing id → `404`; no token → `401` ✓
- [x] 4.6 Backend typecheck + frontend typecheck/build pass; boxes ticked
