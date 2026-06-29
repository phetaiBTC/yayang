## Why

Purchase orders (Section 4) sit at status `pending` and stock is still `0` for every book. Importing is the step that turns an ordered PO into real inventory: staff confirm the received quantities, the system records an `import` against the PO, **raises `book.stock`**, and flips the PO to `received`. This is the first place stock ever increases, and it must be atomic and non-repeatable (a PO cannot be imported twice). Selling (Section 6) depends on stock existing, so importing is its prerequisite.

## What Changes

- **Import a pending PO**: `POST /api/imports` creates an `import` + `import_details` for a PO, increments each book's stock by the received quantity, and sets the PO's status to `received` — all inside one transaction.
- **Received quantities**: the request may specify received qty per line (defaulting to the PO's ordered quantities); only books that belong to the PO are accepted.
- **Block double / non-pending import**: importing a PO whose status is not `pending` is rejected with `409` ("already imported").
- **Verify the PO bill**: reuse `GET /api/purchase-orders/:id` to review lines before importing; the import endpoint is the hard guard.
- **Review imports**: `GET /api/imports` and `GET /api/imports/:id` to list/inspect import records (also feeds the Section 8 imports report).
- **Frontend**: an Importing view — pick a pending PO, see its lines with editable received quantities, confirm, and watch stock update.

## Capabilities

### New Capabilities
- `importing`: receive a pending purchase order into stock — atomic stock increase, PO state transition to `received`, double-import protection, and import record review.

### Modified Capabilities
<!-- None. Reuses existing Book/PurchaseOrder/Import/ImportDetail/Employee entities; no existing requirement changes. -->

## Impact

- **Backend** (`back/`): new `ImportingModule` (`ImportsController`, `ImportsService`). Stock mutation + PO transition wrapped in `em.transactional()`. Reuses `Import` / `ImportDetail` / `PurchaseOrder` / `Book` entities, `@CurrentUser()`, `serialize()`, `{ data, message }`.
- **Frontend** (`front/`): new `ImportsView` (select pending PO → received-qty editor → confirm), imports API module, route + menu + dashboard tile (auth-gated). Reuses the purchase-orders API.
- **API**: adds `POST /api/imports`, `GET /api/imports`, `GET /api/imports/:id`.
- **Dependencies**: none new.
- **Data**: no schema change — uses `imports` / `import_details` tables and mutates `books.stock` and `purchase_orders.status` from existing tables.
