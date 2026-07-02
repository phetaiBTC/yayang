# UI Localization

### Requirement: All UI text renders in Lao
The frontend SHALL display every user-facing string in Lao (ພາສາລາວ). No English text SHALL remain visible in the interface, except intentional bilingual sublabels already present by design. This covers navigation, page titles, buttons, table headers, form field labels, input placeholders, empty-state and loading text, confirmation dialogs, and toast messages across all views and shared components.

#### Scenario: Navigation and page titles in Lao
- **WHEN** a user opens any page in the app
- **THEN** the navigation menu items, the page title/header, and all visible action buttons are shown in Lao

#### Scenario: Forms and inputs in Lao
- **WHEN** a user opens a create or edit form
- **THEN** every field label, dropdown option label, and input placeholder is shown in Lao

#### Scenario: No residual English in the UI
- **WHEN** a reviewer inspects any rendered page
- **THEN** no hardcoded English UI string is displayed (aside from intentional bilingual sublabels)

### Requirement: Shared CRUD components render Lao feedback
The shared components (`ResourceManager`, `CrudTable`, `CrudDialog`) SHALL render all composed and literal strings in Lao, including create/edit dialog titles derived from a resource `title`, delete confirmation text, and success/error feedback. Composed phrases SHALL read naturally in Lao word order rather than a literal English-order concatenation.

#### Scenario: Create/edit dialog titles
- **WHEN** a user clicks add or edit on a resource managed by `ResourceManager`
- **THEN** the dialog title reads as natural Lao (e.g. "ເພີ່ມ<resource>" / "ແກ້ໄຂ<resource>") for that resource

#### Scenario: Delete confirmation in Lao
- **WHEN** a user triggers a delete action
- **THEN** the confirmation dialog header, message, and both accept/cancel buttons are shown in Lao

#### Scenario: Toast feedback in Lao
- **WHEN** an action succeeds or fails (load, save, delete, or a business-rule block)
- **THEN** the toast summary and detail are shown in Lao

### Requirement: Status labels are localized without changing stored values
User-facing status values (e.g. purchase order `pending`/`received`; reservation `booked`/`ready`/`completed`/`cancelled`) SHALL be displayed with Lao labels, while the underlying values sent to and received from the API SHALL remain unchanged.

#### Scenario: Status shown in Lao
- **WHEN** a record with a status is displayed
- **THEN** the status is rendered with its Lao label

#### Scenario: API values unchanged
- **WHEN** the frontend sends or compares a status value
- **THEN** it uses the original API value (e.g. `pending`), not the Lao display label

### Requirement: Consistent Lao terminology
The UI SHALL use one consistent Lao term per domain concept and action across all pages and components (per the change's glossary), so the same concept is never shown with differing Lao words.

#### Scenario: Same term across pages
- **WHEN** the same concept or action (e.g. Save, Delete, Book, Customer) appears on different pages
- **THEN** it is displayed using the same Lao term everywhere

### Requirement: No change to application behavior or contracts
Localization SHALL be presentation-only. Routing, API endpoints, request/response payload keys, entity field names, validation logic, and persisted values SHALL be unchanged by this change.

#### Scenario: Behavior preserved after translation
- **WHEN** any page is used after localization
- **THEN** navigation, data loading, form submission, and validation behave exactly as before, and only the displayed language differs
