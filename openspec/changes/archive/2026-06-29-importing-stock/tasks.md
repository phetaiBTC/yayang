## 1. Importing — DTO & Service (backend)

- [x] 1.1 `CreateImportLineDto` (bookId int+positive, qty int ≥1) and `CreateImportDto` (poId, optional `lines[]` with `@ValidateNested`/`@Type`)
- [x] 1.2 `ImportsService.create(empId, dto)` — load PO; `404` if missing
- [x] 1.3 Resolve received lines: use `dto.lines` if given (each bookId must belong to PO → `400`), else default to PO ordered quantities
- [x] 1.4 In `em.transactional()`: re-load PO + assert `status === 'pending'` (else `409`), create `Import` + `ImportDetail`s, `book.stock += qty`, set PO `status = 'received'`, flush
- [x] 1.5 `findAll()` — imports populated with order + supplier + employee + details; `lineCount`/`totalQty`
- [x] 1.6 `findOne(id)` — import with `details.book` populated; `404` when missing

## 2. Importing — Controller & Module (backend)

- [x] 2.1 `ImportsController` `POST /api/imports` (`@CurrentUser()`), `GET /`, `GET /:id` under `JwtAuthGuard`
- [x] 2.2 `{ data, message }` envelope via `serialize()`
- [x] 2.3 `ImportingModule` + import into `AppModule`

## 3. Frontend — Importing

- [x] 3.1 imports API module (`list`, `get`, `create`)
- [x] 3.2 `ImportsView` — list imports (import #, PO #, supplier, by, date, lines, total qty) + "New import"
- [x] 3.3 Import dialog — pick a pending PO (filtered from purchase-orders list), show its lines with editable received qty (default = ordered)
- [x] 3.4 Confirm → POST; Toast; refresh list (received POs drop out of the pending picker)
- [x] 3.5 Route + menu entry + dashboard tile (auth-gated)

## 4. Verification

- [x] 4.1 Import a pending PO → import + details created, `book.stock` 0→10, PO → `received` (verified live)
- [x] 4.2 Re-import same PO → `409`, stock unchanged (still 10) — double-import blocked ✓
- [x] 4.3 Unknown PO → `404`; book not in PO → `400`; explicit received qty (3<ordered 4) → `stock += 3` (→13) ✓
- [x] 4.4 List + get-by-id shape correct; missing id → `404`; no token → `401`
- [x] 4.5 Backend typecheck + frontend typecheck/build pass; boxes ticked
