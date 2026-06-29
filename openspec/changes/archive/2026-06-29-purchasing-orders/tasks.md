## 1. Auth helper

- [x] 1.1 Add `@CurrentUser()` param decorator in `auth/` (returns `req.user`: empId, username, role); export from barrel

## 2. Purchasing — DTOs & Service (backend)

- [x] 2.1 `CreatePoLineDto` (bookId int+positive, qty int ≥1, costPrice number ≥0)
- [x] 2.2 `CreatePurchaseOrderDto` (supId, lines[] with `@ValidateNested`/`@Type` + `@ArrayMinSize(1)`)
- [x] 2.3 `PurchaseOrdersService.create(empId, dto)` — validate supplier + all bookIds exist; reject empty (DTO) / unknown refs (400)
- [x] 2.4 Persist header + details inside `em.transactional()`; status `pending`; employee from `empId` (getReference); costPrice as string
- [x] 2.5 `findAll()` — headers populated with supplier + employee; derive `lineCount` + `totalCost`
- [x] 2.6 `findOne(id)` — PO with `details.book` populated; `404` when missing

## 3. Purchasing — Controller & Module (backend)

- [x] 3.1 `PurchaseOrdersController` `POST /api/purchase-orders` (uses `@CurrentUser()`), `GET /`, `GET /:id` under `JwtAuthGuard`
- [x] 3.2 `{ data, message }` envelope via `serialize()`
- [x] 3.3 `PurchasingModule` + import into `AppModule`

> Schema fix (discovered during 5.1, approved): money columns were `decimal(10,0)` (rounded 7.5→8). Set `precision:12, scale:2` on Book.price, PurchaseOrderDetail.costPrice, Sale.total, SaleDetail.price, Reservation.deposit, ReservationDetail.price; migration `Migration20260629023511_DecimalScale` created + applied.

## 4. Frontend — Purchasing

- [x] 4.1 purchase-orders API module (`list`, `get`, `create`)
- [x] 4.2 `PurchaseOrdersView` — list existing POs (supplier, ordered-by, date, lines, total, status Tag)
- [x] 4.3 Create-PO Dialog — supplier Select + editable lines table (add/remove book rows: book Select, qty, cost) reusing `booksApi`/`suppliersApi`
- [x] 4.4 Block save when no lines or missing supplier (computed `canSave`); Toast; refresh list on success
- [x] 4.5 Route + menu entry + dashboard tile (auth-gated)

## 5. Verification

- [x] 5.1 Create PO with ≥1 line → `pending`, lines persisted, `emp_id` from token (verified: orderer=admin, not body)
- [x] 5.2 Empty `lines[]` → `400`, nothing created; unknown supplier/book → `400` (all verified live)
- [x] 5.3 List + get-by-id return correct shape (lineCount/totalCost, populated book); missing id → `404`; no token → `401`
- [x] 5.4 Backend typecheck + frontend typecheck/build pass; fractional money round-trips (total 58.5, price 19.99); boxes ticked
