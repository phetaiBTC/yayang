## Context

The `imports` / `import_details` tables and entities exist (Section 1): `Import` links to `PurchaseOrder` + `Employee` with a `details` collection; `ImportDetail` links to `Book` with a `qty`. Section 4 created POs in `pending` with line items, and exposed `GET /api/purchase-orders/:id` to review a bill. `Book.stock` defaults to `0` and has only ever been read. CLAUDE.md mandates that stock mutations run inside `em.transactional()` and that a PO "cannot be imported twice". This change is the producer of stock and the consumer of pending POs; it must be atomic and idempotent-safe (one import per PO).

## Goals / Non-Goals

**Goals:**
- Atomically: create the import record + details, increase `book.stock` per received line, and set `PurchaseOrder.status = 'received'`.
- Reject importing a PO that is not `pending` (already received / unknown) with a clear error.
- Let staff confirm received quantities (default = ordered quantities), restricted to the PO's books.
- Provide import list/detail reads for review and downstream reporting.

**Non-Goals:**
- Partial / multi-shipment imports against one PO (one import fully receives a PO; status goes straight to `received`). Revisit later if needed.
- Editing or reversing an import (no stock decrements here — that's selling).
- Supplier returns, damaged-goods handling, or cost re-evaluation.
- Locking/concurrency beyond a status check inside the transaction.

## Decisions

- **All-or-nothing in `em.transactional()`.** Inside the callback: re-load the PO (with details) using the transaction's EM, assert `status === 'pending'`, create the `Import` + `ImportDetail` rows, do `book.stock += qty` for each line, set `po.status = 'received'`, flush. If anything throws, nothing commits — stock and status never drift apart.
- **Status check inside the transaction guards double-import.** Re-reading and checking `pending` within the same transaction (not just at the controller) closes the obvious race; a second import sees `received` → `409`. A pessimistic row lock is noted as a future hardening but omitted for this single-instance dev scope.
- **Received quantities, defaulting to ordered.** `CreateImportDto { poId, lines?: { bookId, qty }[] }`. If `lines` is omitted/empty, the service imports every PO line at its ordered `qty`. If provided, each `bookId` MUST belong to the PO (else `400`) and `qty >= 1`; books not listed are treated as not received (not stocked). This honors the spec's "received quantities" while keeping the common case one click.
- **Stock increment uses the loaded Book entity.** Books are loaded via the PO details (or by id within the transaction) and mutated through the managed entity so MikroORM's unit of work issues the `UPDATE`; no raw SQL.
- **Employee from JWT** via `@CurrentUser()` (consistent with purchasing) — the importer is recorded, not client-supplied.
- **Reads shaped for UI + reporting.** `GET /api/imports` lists imports with PO + employee + date and a line summary; `GET /:id` returns details with `book` populated. `404` on missing.
- **Bill verification stays on the existing PO endpoint.** No new "bill" route — `GET /api/purchase-orders/:id` already returns the PO with lines; the frontend shows a warning when `status === 'received'` and the import POST is the authoritative block.
- **Envelope + guard**: `{ data, message }`, `JwtAuthGuard` (admin + staff).

## Risks / Trade-offs

- **One import fully receives a PO** → no partial receipts; if a shipment arrives incomplete, staff import the actual received quantities (some lines lower/omitted) but the PO still closes to `received`. Acceptable for scope; multi-shipment is a future change.
- **No row lock on the PO** → concurrent imports are guarded by the in-transaction status check, sufficient for a single-instance deployment; note for scale-out.
- **Negative/zero received qty** → DTO enforces `qty >= 1`; omitting a line means "not received" rather than encoding 0.
- **Stock can only go up here** → correct for importing; the symmetric decrement lives in Selling, which must also be transactional (separate change).
- **Re-loading the PO inside the transaction** is a second read but guarantees the status check and the writes share one unit of work — a deliberate correctness-over-microperf choice.
