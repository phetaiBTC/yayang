## 1. Glossary (shared reference — apply consistently in every task)

- [x] 1.1 Adopt these Lao terms for domain nouns: Book=ປຶ້ມ, Category=ໝວດໝູ່, Book Type=ປະເພດປຶ້ມ, Supplier=ຜູ້ສະໜອງ, Customer=ລູກຄ້າ, Employee=ພະນັກງານ, Purchase Order=ໃບສັ່ງຊື້, Import=ການນຳເຂົ້າ, Sale=ການຂາຍ, Reservation=ການຈອງ, Report=ລາຍງານ, Dashboard=ໜ້າຫຼັກ
- [x] 1.2 Adopt these Lao terms for actions/fields: Add/New=ເພີ່ມ, Edit=ແກ້ໄຂ, Delete=ລຶບ, Save=ບັນທຶກ, Cancel=ຍົກເລີກ, Search=ຄົ້ນຫາ, Refresh=ໂຫຼດຄືນ, Confirm=ຢືນຢັນ, Title=ຊື່ປຶ້ມ, Price=ລາຄາ, Stock=ສະຕັອກ, Quantity=ຈຳນວນ, Total=ລວມ, Date=ວັນທີ, Status=ສະຖານະ, ID=ລະຫັດ, Username=ຊື່ຜູ້ໃຊ້, Password=ລະຫັດຜ່ານ, Login=ເຂົ້າສູ່ລະບົບ, Logout=ອອກຈາກລະບົບ
- [x] 1.3 Adopt these Lao status labels (display only, values unchanged): pending=ລໍຖ້າ, received=ຮັບແລ້ວ, booked=ຈອງແລ້ວ, ready=ພ້ອມຮັບ, completed=ສຳເລັດ, cancelled=ຍົກເລີກ

## 2. Shared components (translate at the source first)

- [x] 2.1 `CrudTable.vue`: translate table toolbar, add/edit/delete/refresh buttons, search placeholder, empty-state and loading text to Lao
- [x] 2.2 `CrudDialog.vue`: translate dialog save/cancel buttons and any field-level literal text to Lao
- [x] 2.3 `ResourceManager.vue`: translate composed dialog titles (`New`→`ເພີ່ມ`, `Edit`→`ແກ້ໄຂ`) and delete-confirm text into natural Lao word order (e.g. `ເພີ່ມ${title}`); remove English-only pluralization (`replace(/s$/)`, `toLowerCase()`) that does not apply to Lao
- [x] 2.4 `ResourceManager.vue`: translate toast summary/detail literals (`Saved`, `Save failed`, `Load failed`, `Deleted`, `Cannot delete`, `Confirm delete`, `Unexpected error`, `Cancel`, `Delete`) to Lao

## 3. Navigation & layout

- [x] 3.1 `MainLayout.vue`: translate all nav menu `label`s (Dashboard, Books, Purchasing, Imports, Sales, Reservations, Reports, Categories, Book Types, Customers, Suppliers, Employees) to Lao per glossary
- [x] 3.2 `MainLayout.vue`: translate header/user-menu items and Logout to Lao
- [x] 3.3 `App.vue`: translate any user-facing text if present

## 4. Auth & registration views

- [x] 4.1 `LoginView.vue`: translate placeholders (Username/Password), Login button, and login-failed toast summary/detail (keep intentional bilingual subtitle if desired)
- [x] 4.2 `RegisterView.vue`: translate labels, placeholders, buttons, and toast/validation messages to Lao
- [x] 4.3 `OtpView.vue`: translate prompts, button labels, and success/error toast messages to Lao

## 5. Config-driven CRUD views (pass Lao props)

- [x] 5.1 `BooksView.vue`: translate `title`, `columns[].header`, `fields[].label`, and dropdown option labels to Lao
- [x] 5.2 `CategoriesView.vue`: translate `title`, headers, and field labels to Lao
- [x] 5.3 `BookTypesView.vue`: translate `title`, headers, and field labels to Lao
- [x] 5.4 `CustomersView.vue`: translate `title`, headers, and field labels to Lao
- [x] 5.5 `SuppliersView.vue`: translate `title`, headers, and field labels to Lao
- [x] 5.6 `EmployeesView.vue`: translate `title`, headers, field labels, and any inline text to Lao

## 6. Transaction & report views

- [x] 6.1 `HomeView.vue`: translate dashboard headings, card/labels, and any summary text to Lao
- [x] 6.2 `PurchaseOrdersView.vue`: translate headers, labels, buttons, line-item text, status labels, and toast messages to Lao (keep API status values)
- [x] 6.3 `ImportsView.vue`: translate headers, labels, buttons, and toast messages to Lao (keep API status values)
- [x] 6.4 `SalesView.vue`: translate headers, labels, buttons, line-item text, and toast messages to Lao
- [x] 6.5 `ReservationsView.vue`: translate headers, labels, buttons, status labels, and toast messages to Lao (keep API status values)
- [x] 6.6 `ReportsView.vue`: translate report titles, filter labels, table headers, chart labels, and toast messages to Lao

## 7. Status label mapping

- [x] 7.1 For each view rendering a status (`PurchaseOrdersView`, `ImportsView`, `ReservationsView`): add a Lao display map and apply it only at render, leaving API payloads and conditionals on the original English values

## 8. Verification

- [x] 8.1 Run `cd front && npm run build` (or `vue-tsc`) and confirm no type/template errors introduced
- [x] 8.2 Grep sweep for residual English UI strings: `label="`, `header="`, `placeholder="`, `summary:`, `detail:`, and inline template text across `front/src/views` and `front/src/components`; translate any stragglers
- [ ] 8.3 Load each page (`cd front && npm run dev`) and visually confirm all navigation, forms, dialogs, toasts, and status tags display Lao
- [x] 8.4 Confirm behavior unchanged: create/edit/delete, transactions, and status transitions still work and send original API values
