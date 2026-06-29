## Why

Importing (Section 5) put stock into books; Selling is where it leaves. This is the point-of-sale flow: staff pick a customer, add book lines, take a payment method, and confirm — the system records the sale, computes the total, and **decreases `book.stock`**, all atomically. It is the symmetric counterpart to importing and enforces the core rule "cannot sell more than available stock". Reporting (Section 8) — sales and best-sellers — reads directly from what this builds.

## What Changes

- **Record a sale**: `POST /api/sales` accepts a customer, a non-empty `lines[]` (book + qty), and a payment method; it persists a `sale` + `sale_details`, computes the total, and decrements stock — all in one transaction.
- **Stock validation**: a sale is rejected with `400` if any book's requested quantity (summed across lines) exceeds its available stock; nothing is written.
- **Server-set prices**: each line's unit price is taken from the book's current `price` (snapshot at sale time), not the request body — the client cannot set arbitrary prices, and the total is server-computed.
- **Payment method**: one of `cash`, `transfer`, `qr`.
- **Employee + total are server-controlled**: `emp_id` comes from the JWT; `total` is summed from line prices.
- **Review sales**: `GET /api/sales` and `GET /api/sales/:id` to list/inspect sales (feeds the Section 8 sales + best-seller reports).
- **Frontend**: a POS sale view — customer picker, a line editor that caps qty at available stock, a payment-method dropdown, a live total, and confirm.

## Capabilities

### New Capabilities
- `selling`: record point-of-sale sales with stock-validated lines, server-computed totals, payment method, atomic stock decrement, and sale review.

### Modified Capabilities
<!-- None. Reuses existing Sale/SaleDetail/Book/Customer/Employee entities; no existing requirement changes. -->

## Impact

- **Backend** (`back/`): new `SellingModule` (`SalesController`, `SalesService`). Stock validation + decrement + total computation wrapped in `em.transactional()`. Reuses `Sale` / `SaleDetail` / `Book` / `Customer` / `Employee` entities, `@CurrentUser()`, `serialize()`, `{ data, message }`.
- **Frontend** (`front/`): new `SalesView` (POS: customer Select, stock-capped line editor, payment Dropdown, live total) + a sales-history list; sales API module; route + menu + dashboard tile (auth-gated). Reuses `booksApi` / `customersApi`.
- **API**: adds `POST /api/sales`, `GET /api/sales`, `GET /api/sales/:id`.
- **Dependencies**: none new.
- **Data**: no schema change — uses `sales` / `sale_details` tables (decimal money already fixed to scale 2) and mutates `books.stock`.
