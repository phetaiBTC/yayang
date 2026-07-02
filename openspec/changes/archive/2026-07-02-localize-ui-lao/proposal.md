## Why

The frontend currently displays almost all UI text in English (navigation, buttons, table headers, form labels, dialogs, toast messages, validation feedback), while the product targets Lao-speaking bookstore staff and customers. Only the app title is in Lao. Users need every page in Lao (ພາສາລາວ) to operate the system confidently.

## What Changes

- Translate **all** user-facing UI text in `front/` to Lao — every page and shared component, with no English remaining in the interface.
- Scope of strings to convert:
  - **Navigation** (`MainLayout.vue`) — menu item labels, header/user actions, logout.
  - **Standalone views** — `LoginView`, `OtpView`, `RegisterView`, `HomeView`, `ImportsView`, `PurchaseOrdersView`, `SalesView`, `ReservationsView`, `ReportsView`, `EmployeesView`, `CustomersView`, `SuppliersView`.
  - **Config-driven views** — `BooksView`, `CategoriesView`, `BookTypesView` and any view feeding `title` / `columns[].header` / `fields[].label` strings into shared components.
  - **Shared components** — `ResourceManager.vue`, `CrudTable.vue`, `CrudDialog.vue`: hardcoded strings such as `New {title}`, `Edit {title}`, `Saved`, `Save failed`, `Load failed`, `Confirm delete`, `Cancel`, `Delete`, etc.
  - **Feedback** — all PrimeVue `Toast` `summary`/`detail`, `useConfirm` dialog text, empty-state and loading text, input `placeholder`s.
  - **Status values** rendered to users (e.g. purchase order `pending`/`received`, reservation `booked`/`ready`/`completed`/`cancelled`) shown via Lao display labels while preserving the underlying API values.
- **Approach:** direct in-place replacement of strings with Lao. No i18n library, no language switcher, single language (Lao). Bilingual "Lao / English" sublabels that already exist (e.g. login subtitle) may be kept where intentional.
- Keep non-UI strings unchanged: API request/response keys, entity field names, route paths, `console`/log text, and code identifiers stay as-is.

## Capabilities

### New Capabilities
- `ui-localization`: Defines the requirement that the entire frontend UI renders in Lao — covering navigation, views, shared CRUD components, form labels/placeholders, action buttons, confirmation dialogs, toast feedback, and user-facing status labels — while backend contracts (API keys, stored values) remain unchanged.

### Modified Capabilities
<!-- None. Backend behavior and existing capability requirements are unchanged; this is a presentation-layer change only. -->

## Impact

- **Affected code:** `front/src/` only — `views/*.vue` (all), `components/*.vue` (`ResourceManager`, `CrudTable`, `CrudDialog`), and `MainLayout.vue`. No backend (`back/`) changes.
- **Dependencies:** none added or removed.
- **APIs / data:** unchanged — API endpoints, payload keys, and persisted status values are untouched; only their human-readable display is translated.
- **Risk:** low; presentation-only. Main risk is missing a string or breaking a template binding, mitigated by a per-file checklist and a final sweep for residual English.
