## Context

The `purchase_orders` and `purchase_order_details` tables and entities already exist (Section 1), with `PurchaseOrder.status` defaulting to `pending`, `orderDate` set on insert, and `@ManyToOne` links to `Supplier`, `Employee`, and (on the detail) `Book`. Section 2 established the controller/service/DTO + `{ data, message }` conventions, `JwtAuthGuard`, and the `serialize()` helper. This change adds the header+lines write path and read endpoints, following those conventions. It is the producer side of the import flow: it must leave POs in a clean `pending` state that Section 5 can later mark `received`.

## Goals / Non-Goals

**Goals:**
- One-request creation of a PO header + its line items, atomic (all-or-nothing).
- Reject empty orders and invalid references (unknown supplier/book) before writing.
- Record the ordering employee from the JWT, not the client payload.
- Provide list and detail reads to review POs and to drive the import step.

**Non-Goals:**
- Importing / receiving stock (Section 5) — status stays `pending` here.
- Editing or cancelling an existing PO (not in the Section 4 spec; can be added later).
- Supplier-side pricing logic, taxes, or currency handling beyond storing `cost_price`.
- Stock changes of any kind (POs never touch `Book.stock`).

## Decisions

- **Header + lines in one DTO, validated nested.** `CreatePurchaseOrderDto { supId, lines: CreatePoLineDto[] }`; lines validated with `@ValidateNested({ each: true })` + `@Type(() => CreatePoLineDto)` and `@ArrayMinSize(1)` so an empty `lines[]` fails at the `ValidationPipe` with `400` before reaching the service. Each line: `bookId` (int, positive), `qty` (int, ≥1), `costPrice` (number, ≥0).
- **Atomic write via `em.transactional()`.** Per CLAUDE.md, multi-write operations are wrapped in a transaction. The header and all details commit together or not at all. Even though no stock mutates, partial PO writes would be corrupt data.
- **Employee from JWT.** A new `@CurrentUser()` param decorator extracts `req.user` (set by `JwtStrategy.validate`). The service receives `empId` and loads an `Employee` reference (`em.getReference`) — the body cannot spoof the orderer.
- **Reference validation.** Supplier loaded with `findOneOrFail` (→ `404`/`400` if missing). Books validated by fetching all referenced `bookId`s in one query and checking the set; any unknown id → `400` with the offending id. Avoids N round-trips and gives a clear error.
- **`costPrice` stored as string.** The entity decimal maps to `string` in TS (precision-safe); the service converts the incoming number with `String(costPrice)`, matching the Section 2 books pattern.
- **Reads shaped for UI + import.** `GET /api/purchase-orders` returns headers populated with `supplier` and `employee` plus a derived `lineCount` and `totalCost` (sum of qty×costPrice) for the list; `GET /:id` returns the PO with `details.book` populated. `totalCost` is computed in the service, not stored.
- **Access:** `JwtAuthGuard` only (admin + staff) — the spec frames purchasing as a staff activity; no `@Roles` restriction.
- **Envelope:** `{ data, message }`, consistent with prior sections.

## Risks / Trade-offs

- **No PO edit/cancel** → if staff make a mistake, the only recourse is creating a new PO; acceptable for this scope and explicitly out of the Section 4 spec. Revisit if needed.
- **`totalCost` computed on read, not stored** → always consistent with lines, slightly more compute per list call; negligible at expected volumes and avoids a denormalized field that could drift.
- **Validating books in a single `IN` query** → assumes modest line counts per PO; fine for a bookstore. Duplicate `bookId` lines are allowed (two lines for the same book) — treated as valid; the import step will sum quantities.
- **Transaction + request-context EM** → must use the `em` provided inside `em.transactional()` callback for all writes to stay in the same unit of work; mixing the outer EM would break atomicity. Noted for implementation.
