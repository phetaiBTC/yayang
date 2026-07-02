## Context

The `front/` Vue 3 + PrimeVue app renders nearly all UI text in English, hardcoded directly in templates and `<script setup>` blocks. There is **no i18n library** (`vue-i18n` is not installed). Strings live in three places:

1. **Standalone views** — inline template text, `label`/`placeholder`/`header` attributes, and `<script>` toast `summary`/`detail` strings (e.g. `ImportsView`, `PurchaseOrdersView`, `SalesView`, `ReservationsView`, `ReportsView`, `LoginView`, `OtpView`, `RegisterView`, `HomeView`, `EmployeesView`, `CustomersView`, `SuppliersView`).
2. **Config-driven views** — pass Lao/English strings as props into shared components: `title`, `columns[].header`, `fields[].label`, dropdown `options[].label` (e.g. `BooksView`, `CategoriesView`, `BookTypesView`).
3. **Shared components** — `ResourceManager.vue`, `CrudTable.vue`, `CrudDialog.vue` build strings from `title` (e.g. `` `New ${title}` ``, `` `Edit ${title}` ``, `` `Delete this ${title.toLowerCase()}?` ``) and hold literal feedback strings (`Saved`, `Save failed`, `Load failed`, `Confirm delete`, `Cancel`, `Delete`, `Unexpected error`).

The decision (confirmed with the user) is **direct in-place replacement** to Lao — no library, no switcher, single language.

## Goals / Non-Goals

**Goals:**
- Every user-visible string in `front/` renders in Lao (ພາສາລາວ).
- No behavioral change: routing, API calls, validation logic, and persisted values are identical before and after.
- Shared CRUD components produce correct Lao phrasing for every view that uses them.
- User-facing status values (purchase order, reservation) show Lao labels while the underlying API values stay English.

**Non-Goals:**
- No `vue-i18n` (or any i18n dependency) and no language switcher / multi-locale support.
- No changes to `back/`, API contracts, DTO keys, entity field names, or route paths.
- No changes to `console`/log messages or code identifiers.
- No visual/layout redesign beyond text length differences.

## Decisions

**D1 — Direct string replacement over an i18n framework.**
The requirement is a permanent single-language (Lao) UI, not runtime locale switching. Inline replacement avoids a new dependency (per CLAUDE.md's "no new frameworks without a spec change" caution) and keeps diffs localized and reviewable. *Alternative considered:* `vue-i18n` with a `lo` locale — rejected as over-engineered for a one-language target and heavier to review/maintain here.

**D2 — Fix shared components at the source, parameterize by Lao `title`.**
`ResourceManager`/`CrudTable`/`CrudDialog` compose strings from the `title` prop. Translate the literal fragments in these components once (`New`→`ເພີ່ມ`, `Edit`→`ແກ້ໄຂ`, `Delete`→`ລຶບ`, etc.) and pass a Lao noun as `title` from each view (e.g. `Books`→`ປຶ້ມ`). English pluralization/`replace(/s$/)` logic that only makes sense in English is removed or made Lao-appropriate, since Lao has no plural suffixes.
- Verify the composed phrase reads naturally in Lao: prefer `` `${verb}${title}` `` word order (e.g. `ເພີ່ມປຶ້ມ`, `ແກ້ໄຂປຶ້ມ`) rather than a literal English-order concatenation.

**D3 — Status display mapping, values unchanged.**
Where a status enum (`pending`/`received`, `booked`/`ready`/`completed`/`cancelled`) is rendered (e.g. in a `Tag`), map to a Lao label at the display layer only; keep sending/comparing the original English value in API calls and conditionals. Use a small local lookup (object map) near the component, not a global store.

**D4 — Translation glossary for consistency.**
Maintain one consistent Lao term per domain concept across all files to avoid drift (e.g. Book=ປຶ້ມ, Category=ໝວດໝູ່, Supplier=ຜູ້ສະໜອງ, Customer=ລູກຄ້າ, Employee=ພະນັກງານ, Save=ບັນທຶກ, Cancel=ຍົກເລີກ, Delete=ລຶບ, Search=ຄົ້ນຫາ, Add/New=ເພີ່ມ, Edit=ແກ້ໄຂ, Price=ລາຄາ, Stock=ສະຕັອກ, Quantity=ຈຳນວນ, Total=ລວມ, Report=ລາຍງານ). The glossary is captured in `tasks.md` as the shared reference and applied uniformly.

## Risks / Trade-offs

- **Missed strings leaving English in the UI** → Mitigation: per-file checklist in `tasks.md` covering all views + components, plus a final repo-wide grep sweep (`label=`, `header=`, `placeholder=`, `summary:`, `detail:`, template text) to catch residuals before sign-off.
- **Breaking template bindings while editing** → Mitigation: only replace string literals, never expression/binding syntax; run `npm run build` / `vue-tsc` and load each page after editing.
- **Inconsistent terminology across files** → Mitigation: single glossary (D4) applied everywhere; reviewer checks against it.
- **Text-length overflow in tables/buttons** → Mitigation: Lao strings kept concise; spot-check dense screens (Sales, Reservations, Reports) for wrapping/truncation.
- **Accidentally translating a persisted/compared status value** → Mitigation: translate only at render (D3); leave conditionals and API payloads on the original English values; grep for status literals in `<script>` to confirm they're untouched.
