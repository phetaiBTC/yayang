## Context

The `sales` / `sale_details` tables and entities exist (Section 1): `Sale` links to `Customer` + `Employee`, has `total` (decimal, now scale 2), `paymentMethod`, and a `details` collection; `SaleDetail` links to `Book` with `qty` + `price` (decimal). Importing (Section 5) established the transactional stock-mutation pattern (`book.stock += qty` inside `em.transactional()` with an in-transaction guard). Selling is the inverse — `book.stock -= qty` — and adds the "cannot oversell" rule. It follows the same purchasing/importing conventions: `@CurrentUser()`, header+lines DTO, `{ data, message }`, `serialize()`.

## Goals / Non-Goals

**Goals:**
- Atomically: create the sale + line items, decrement stock per book, compute and store the total.
- Reject a sale that would oversell any book (summed across duplicate lines) — nothing persists.
- Server-controlled prices (from `book.price`) and total; employee from the token.
- Sale list/detail reads for review and the Section 8 reports.

**Non-Goals:**
- Discounts, taxes, promotions, or manual price overrides (line price = current book price).
- Refunds / returns / sale voiding (no stock re-increment here).
- Walk-in/anonymous sales — a customer is required (the `sales.cus_id` column is non-null).
- Requiring the customer to be OTP-verified to be sold to (master-data customers are valid buyers); revisit if the business asks.
- Receipt printing / payment-gateway integration (payment method is just recorded).

## Decisions

- **All-or-nothing in `em.transactional()`.** Inside the callback: re-load the referenced books with the transaction EM, validate stock against summed demand, create the `Sale` + `SaleDetail`s, do `book.stock -= qty`, set the computed `total`, flush. A failure (including an oversell) rolls everything back.
- **Stock validated on summed demand per book.** Lines are aggregated to `bookId -> totalQty`; each must satisfy `totalQty <= book.stock` (re-read inside the transaction). If any fails, throw `400` listing the offending book(s). This handles two lines for the same book correctly and closes the check-then-write race by validating within the transaction.
- **Line price = book price at sale time.** The DTO line is `{ bookId, qty }` only; the service reads `book.price` and stores it on the `SaleDetail` (a snapshot, so later price changes don't rewrite history). The client cannot set prices.
- **Total is server-computed** as `sum(qty * book.price)`, stored as a string (decimal precision-safe), consistent with the money pattern.
- **Customer required + validated.** `cusId` must reference an existing customer (`400` otherwise). No OTP gate on selling (explicitly a non-goal).
- **Payment method constrained** to `cash | transfer | qr` via `@IsIn`.
- **Employee from JWT** via `@CurrentUser()`; never from the body.
- **Reads shaped for UI + reporting.** `GET /api/sales` lists sales with customer + employee + date + payment + total + line count; `GET /:id` returns details with `book` populated. `404` on missing.
- **Frontend caps qty at stock** (`InputNumber :max="book.stock"`) as a first line of defense; the backend remains authoritative.
- **Envelope + guard**: `{ data, message }`, `JwtAuthGuard` (admin + staff).

## Risks / Trade-offs

- **No row lock on books** → concurrent sales of the same scarce book are guarded by the in-transaction re-read + validation, sufficient for single-instance dev; a `SELECT … FOR UPDATE` (pessimistic lock) is the scale-out hardening, noted but deferred.
- **Price snapshot vs. live price** → storing the price on the line means the sale total is stable even if the book price later changes; this is intended (historical accuracy) at the cost of a denormalized value.
- **Customer mandatory** → no quick anonymous sale; acceptable given the schema, and a generic "walk-in" customer row can be seeded later without code change if desired.
- **Whole-sale rejection on any oversell** → simpler and safer than partial fulfilment; staff adjust the offending line and retry. Matches the spec's "prevent adding beyond available stock".
- **Decrement uses managed entities** (not raw SQL) → relies on the unit of work issuing `UPDATE`s; consistent with importing and keeps one code path for stock.
