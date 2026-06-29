## Why

Books are created with `stock = 0` and stock only ever rises through an **import**, which in turn requires a **purchase order (PO)** to import against. Section 4 builds that first half: staff create a PO to a supplier with one or more book lines, saved as `pending`. This is the prerequisite for Section 5 (Importing), which receives a pending PO and raises stock. Without POs there is no way to bring inventory into the system.

## What Changes

- **Create PO**: `POST /api/purchase-orders` accepts a header (supplier) + a non-empty `lines[]` array (book, qty, cost_price) in one request, persisted atomically as a `purchase_order` (status `pending`) with its `purchase_order_details`.
- **Empty order rejected**: a PO with zero lines is rejected with `400`.
- **Ordering employee from JWT**: the PO's `emp_id` is taken from the authenticated user, not the request body.
- **List & view POs**: `GET /api/purchase-orders` (header list: supplier, date, status, line count/total) and `GET /api/purchase-orders/:id` (full PO with lines) — needed to review orders and to feed the import step.
- **Book selection** for the PO form reuses the existing `GET /api/books`.
- **Frontend**: a Purchasing view — supplier picker, an editable lines table (add/remove book rows with qty + cost) in a Dialog, save, and a list of existing POs with status.

## Capabilities

### New Capabilities
- `purchasing`: create, list, and view supplier purchase orders with header + line-item details and a `pending` lifecycle state.

### Modified Capabilities
<!-- None. Reuses existing Book/Supplier/Employee entities and the books endpoint; no existing requirements change. -->

## Impact

- **Backend** (`back/`): new `PurchasingModule` (`PurchaseOrdersController`, `PurchaseOrdersService`). New `@CurrentUser()` param decorator in `auth/` to read `req.user`. Reuses `PurchaseOrder` / `PurchaseOrderDetail` / `Supplier` / `Book` entities and `EntityManager`; PO creation wrapped in `em.transactional()`.
- **Frontend** (`front/`): new `PurchaseOrdersView` + a line-editor (reuses existing `booksApi`, `suppliersApi`); new purchase-orders API module; route + menu entry (auth-gated, admin + staff).
- **API**: adds `POST/GET /api/purchase-orders`, `GET /api/purchase-orders/:id`.
- **Dependencies**: none new (class-validator/class-transformer already installed).
- **Data**: no schema change — uses the `purchase_orders` and `purchase_order_details` tables from the Section 1 migration. Status stays `pending` here; `received` is set later by Importing.
