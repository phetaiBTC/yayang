## Context

The `reservations` / `reservation_details` tables and entities exist (Section 1): `Reservation` links to `Customer` + `Employee`, has `deposit` (decimal, default 0), `status` (default `booked`), and a `details` collection; `ReservationDetail` links to `Book` with `qty` + `price` (decimal). Prior sections established the header+lines transactional create (purchasing/selling), server-snapshot pricing, `@CurrentUser()`, and `{ data, message }` + `serialize()`. Reservation differs from selling in one key way: it does **not** move stock — it captures intent for books that may not be in stock yet, and becomes fulfilable once Importing brings the stock in.

## Goals / Non-Goals

**Goals:**
- Create a `booked` reservation with line items, atomically, snapshotting line prices from current book prices.
- Record a deposit and expose a bill (total, deposit, balance).
- Enforce the status lifecycle `booked → ready → completed | cancelled` with only valid transitions.
- Allow `booked → ready` only when every reserved book has enough stock; surface ready-eligibility in the list.

**Non-Goals:**
- Stock mutation of any kind. Booking does not reserve/decrement stock; completion does not consume it (the design's stock logic moves stock only on import/sale). See the proposal's Open Question.
- Auto-creating a sale at pickup, partial fulfilment, or per-line status.
- Deposit refunds / payment-gateway integration (the deposit is a recorded amount).
- Expiry/auto-cancellation of stale reservations.

## Decisions

- **Booking is header+lines in `em.transactional()`, no stock touch.** Validate the customer and all books exist (`400` otherwise), then create the `Reservation` (status `booked`) + `ReservationDetail`s with `price = book.price` snapshot. Atomic, but never reads/writes `stock`.
- **Prices snapshotted, total computed on read.** Like selling, the client sends only `{ bookId, qty }`; the service stores `book.price` per line. The bill's `total = Σ qty×price` is computed on `GET /:id` (not stored on the reservation, which only has `deposit`), and `balance = total − deposit`.
- **Deposit via its own endpoint.** `POST /api/reservations/:id/deposit { deposit }` sets the amount (`>= 0`, decimal string). Kept separate from create so a deposit can be taken later; idempotent overwrite of the field. Allowed while `booked` or `ready` (not on `completed`/`cancelled`).
- **Status transitions are explicitly whitelisted.** `PATCH /api/reservations/:id/status { status }` permits exactly: `booked→ready`, `booked→cancelled`, `ready→completed`, `ready→cancelled`. Any other (including no-op or from a terminal state) → `400`. This makes the lifecycle a real state machine, not a free-form field.
- **`booked → ready` is stock-gated.** The transition is allowed only if, for every line, `book.stock >= qty` (summed per book). This realizes "mark ready when stock arrives" — the books must have been imported. If not, `400` naming the short books. Read inside a transaction with the status change so the check and write are consistent.
- **Ready-eligibility surfaced in the list.** `GET /api/reservations` computes a `readyEligible` boolean for each `booked` reservation (all books in stock) so the UI can highlight which can advance — without changing any state.
- **Employee from JWT** via `@CurrentUser()`; reservation records who created it.
- **Reads shaped for UI + reporting.** List includes customer, employee, date, status, deposit, line count, total, readyEligible; `GET /:id` returns the full bill with `details.book` populated. `404` on missing.
- **Envelope + guard**: `{ data, message }`, `JwtAuthGuard` (admin + staff).

## Risks / Trade-offs

- **Ready-gating reads live stock, completion doesn't consume it** → a book can be marked ready and the same stock later sold out from under the reservation (no hold). Acceptable under the "no stock mutation" rule; a true hold/reserve would be a future enhancement (and a schema/logic change). Flagged in the proposal.
- **Total computed on read** → always consistent with line prices and cheap at these volumes; avoids a stored field that could drift from the deposit/balance.
- **Whitelisted transitions** → rigid by design; if the business needs e.g. `ready → booked` (un-ready), it's a one-line addition to the allowed map.
- **Deposit not validated against total** → a deposit may exceed the total (balance goes negative); kept permissive, surfaced in the bill, can be tightened later without a spec change.
- **No concurrency lock on the ready stock-check** → in-transaction read is sufficient for single-instance dev; consistent with the importing/selling stance.
