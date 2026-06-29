## 1. Selling — DTO & Service (backend)

- [x] 1.1 `CreateSaleLineDto` (bookId int+positive, qty int ≥1) and `CreateSaleDto` (cusId, paymentMethod `@IsIn(cash|transfer|qr)`, lines[] `@ValidateNested`/`@Type` + `@ArrayMinSize(1)`)
- [x] 1.2 `SalesService.create(empId, dto)` — validate customer exists (`400`) and all bookIds exist (`400`)
- [x] 1.3 Aggregate demand per book; in `em.transactional()` re-load books, assert `sumQty <= stock` (else `400` listing offenders)
- [x] 1.4 Create `Sale` + `SaleDetail`s with line `price = book.price`; `book.stock -= qty`; `total = Σ qty×price` (toFixed 2); employee from token; flush
- [x] 1.5 `findAll()` — sales populated with customer + employee + details; `lineCount` (+ total stored)
- [x] 1.6 `findOne(id)` — sale with `details.book` populated; `404` when missing

## 2. Selling — Controller & Module (backend)

- [x] 2.1 `SalesController` `POST /api/sales` (`@CurrentUser()`), `GET /`, `GET /:id` under `JwtAuthGuard`
- [x] 2.2 `{ data, message }` envelope via `serialize()`
- [x] 2.3 `SellingModule` + import into `AppModule`

## 3. Frontend — Selling (POS)

- [x] 3.1 sales API module (`list`, `get`, `create`)
- [x] 3.2 `SalesView` — sales history list (sale #, customer, by, date, payment Tag, lines, total) + "New sale"
- [x] 3.3 POS dialog — customer Select, payment-method Select, line editor (book Select, qty capped at `book.stock`), per-line subtotal + live total
- [x] 3.4 Block save when no lines / no customer / qty>stock (computed `canSave`); Toast; refresh list on success
- [x] 3.5 Route + menu entry + dashboard tile (auth-gated)

## 4. Verification

- [x] 4.1 Sale with valid lines → saved, `total=37.50` from book prices, `book.stock` 8→5, emp from token (verified)
- [x] 4.2 Oversell (qty 99, and summed duplicate 3+3>5) → `400`, nothing persisted, stock unchanged ✓
- [x] 4.3 Empty lines → `400`; unknown customer/book → `400`; bad payment method → `400`; stray client price → `400` ✓
- [x] 4.4 List + get-by-id shape correct; missing id → `404`; no token → `401`
- [x] 4.5 Backend typecheck + frontend typecheck/build pass; boxes ticked
