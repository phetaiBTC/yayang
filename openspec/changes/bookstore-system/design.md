# Design: Bookstore Management System

## Architecture
```
Vue 3 + PrimeVue  →  NestJS REST API  →  MikroORM  →  MySQL/PostgreSQL
   front/                back/                            DB
                         │
                    Auth: JWT + RolesGuard (admin/staff)
                    OTP: registration verification
```

## Tech Stack
- **Backend:** NestJS (TypeScript), MikroORM (`@mikro-orm/nestjs`), class-validator
- **Frontend:** Vue 3 `<script setup>`, Vite, PrimeVue, Pinia, Vue Router, Axios
- **Database:** MySQL / PostgreSQL
- **Auth:** JWT + role guard; OTP cached in Redis/in-memory

## Module Map (NestJS)
| Capability | Module | Key routes |
|------------|--------|-----------|
| master-data | MasterDataModule | /api/employees, /api/categories, /api/book-types, /api/books, /api/customers, /api/suppliers |
| registration | RegistrationModule | /api/register, /api/register/verify-otp |
| purchasing | PurchasingModule | /api/purchase-orders |
| importing | ImportingModule | /api/imports |
| selling | SellingModule | /api/sales |
| reservation | ReservationModule | /api/reservations |
| reporting | ReportingModule | /api/reports/* |

## Data Model (DBML — paste into dbdiagram.io)

```dbml
// ===== ຂໍ້ມູນຫຼັກ / Master Data =====
Table employees {
  emp_id int [pk, increment]
  name varchar
  phone varchar
  username varchar [unique]
  password varchar
  role varchar // admin, staff
}
Table categories { cat_id int [pk, increment]; cat_name varchar }
Table book_types { type_id int [pk, increment]; type_name varchar }
Table suppliers {
  sup_id int [pk, increment]
  sup_name varchar
  phone varchar
  address varchar
}
Table customers {
  cus_id int [pk, increment]
  name varchar
  phone varchar
  otp_verified boolean
  created_at datetime
}
Table books {
  book_id int [pk, increment]
  title varchar
  cat_id int [ref: > categories.cat_id]
  type_id int [ref: > book_types.type_id]
  price decimal
  stock int
}

// ===== ສັ່ງຊື້ / Purchase Order =====
Table purchase_orders {
  po_id int [pk, increment]
  sup_id int [ref: > suppliers.sup_id]
  emp_id int [ref: > employees.emp_id]
  order_date datetime
  status varchar // pending, received
}
Table purchase_order_details {
  pod_id int [pk, increment]
  po_id int [ref: > purchase_orders.po_id]
  book_id int [ref: > books.book_id]
  qty int
  cost_price decimal
}

// ===== ນຳເຂົ້າ / Import =====
Table imports {
  import_id int [pk, increment]
  po_id int [ref: > purchase_orders.po_id]
  emp_id int [ref: > employees.emp_id]
  import_date datetime
}
Table import_details {
  imd_id int [pk, increment]
  import_id int [ref: > imports.import_id]
  book_id int [ref: > books.book_id]
  qty int
}

// ===== ຂາຍ / Sale =====
Table sales {
  sale_id int [pk, increment]
  cus_id int [ref: > customers.cus_id]
  emp_id int [ref: > employees.emp_id]
  sale_date datetime
  total decimal
  payment_method varchar // cash, transfer, qr
}
Table sale_details {
  sd_id int [pk, increment]
  sale_id int [ref: > sales.sale_id]
  book_id int [ref: > books.book_id]
  qty int
  price decimal
}

// ===== ຈອງ / Reservation =====
Table reservations {
  res_id int [pk, increment]
  cus_id int [ref: > customers.cus_id]
  emp_id int [ref: > employees.emp_id]
  res_date datetime
  deposit decimal
  status varchar // booked, ready, completed, cancelled
}
Table reservation_details {
  rd_id int [pk, increment]
  res_id int [ref: > reservations.res_id]
  book_id int [ref: > books.book_id]
  qty int
  price decimal
}
```

## MikroORM Entities (back/src/**/entities)

One file per entity. Base pattern shown; relations use `@ManyToOne` / `@OneToMany` with `Collection`.

```ts
// employee.entity.ts
import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';

@Entity({ tableName: 'employees' })
export class Employee {
  @PrimaryKey() empId!: number;
  @Property() name!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ unique: true }) username!: string;
  @Property({ hidden: true }) password!: string;
  @Property() role!: string; // admin, staff

  @OneToMany(() => PurchaseOrder, po => po.employee) purchaseOrders = new Collection<PurchaseOrder>(this);
  @OneToMany(() => Import, i => i.employee) imports = new Collection<Import>(this);
  @OneToMany(() => Sale, s => s.employee) sales = new Collection<Sale>(this);
  @OneToMany(() => Reservation, r => r.employee) reservations = new Collection<Reservation>(this);
}
```

```ts
// category.entity.ts
@Entity({ tableName: 'categories' })
export class Category {
  @PrimaryKey() catId!: number;
  @Property({ fieldName: 'cat_name' }) catName!: string;
  @OneToMany(() => Book, b => b.category) books = new Collection<Book>(this);
}

// book-type.entity.ts
@Entity({ tableName: 'book_types' })
export class BookType {
  @PrimaryKey() typeId!: number;
  @Property({ fieldName: 'type_name' }) typeName!: string;
  @OneToMany(() => Book, b => b.bookType) books = new Collection<Book>(this);
}

// supplier.entity.ts
@Entity({ tableName: 'suppliers' })
export class Supplier {
  @PrimaryKey() supId!: number;
  @Property({ fieldName: 'sup_name' }) supName!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ nullable: true }) address?: string;
  @OneToMany(() => PurchaseOrder, po => po.supplier) purchaseOrders = new Collection<PurchaseOrder>(this);
}

// customer.entity.ts
@Entity({ tableName: 'customers' })
export class Customer {
  @PrimaryKey() cusId!: number;
  @Property() name!: string;
  @Property({ nullable: true }) phone?: string;
  @Property({ fieldName: 'otp_verified', default: false }) otpVerified = false;
  @Property({ fieldName: 'created_at', onCreate: () => new Date() }) createdAt = new Date();
  @OneToMany(() => Sale, s => s.customer) sales = new Collection<Sale>(this);
  @OneToMany(() => Reservation, r => r.customer) reservations = new Collection<Reservation>(this);
}
```

```ts
// book.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';

@Entity({ tableName: 'books' })
export class Book {
  @PrimaryKey() bookId!: number;
  @Property() title!: string;
  @ManyToOne(() => Category, { fieldName: 'cat_id' }) category!: Category;
  @ManyToOne(() => BookType, { fieldName: 'type_id' }) bookType!: BookType;
  @Property({ type: 'decimal' }) price!: string;
  @Property({ default: 0 }) stock = 0;
}
```

```ts
// purchase-order.entity.ts
@Entity({ tableName: 'purchase_orders' })
export class PurchaseOrder {
  @PrimaryKey() poId!: number;
  @ManyToOne(() => Supplier, { fieldName: 'sup_id' }) supplier!: Supplier;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'order_date', onCreate: () => new Date() }) orderDate = new Date();
  @Property({ default: 'pending' }) status = 'pending'; // pending, received
  @OneToMany(() => PurchaseOrderDetail, d => d.order) details = new Collection<PurchaseOrderDetail>(this);
}

// purchase-order-detail.entity.ts
@Entity({ tableName: 'purchase_order_details' })
export class PurchaseOrderDetail {
  @PrimaryKey() podId!: number;
  @ManyToOne(() => PurchaseOrder, { fieldName: 'po_id' }) order!: PurchaseOrder;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ fieldName: 'cost_price', type: 'decimal' }) costPrice!: string;
}
```

```ts
// import.entity.ts
@Entity({ tableName: 'imports' })
export class Import {
  @PrimaryKey() importId!: number;
  @ManyToOne(() => PurchaseOrder, { fieldName: 'po_id' }) order!: PurchaseOrder;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'import_date', onCreate: () => new Date() }) importDate = new Date();
  @OneToMany(() => ImportDetail, d => d.import) details = new Collection<ImportDetail>(this);
}

// import-detail.entity.ts
@Entity({ tableName: 'import_details' })
export class ImportDetail {
  @PrimaryKey() imdId!: number;
  @ManyToOne(() => Import, { fieldName: 'import_id' }) import!: Import;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
}
```

```ts
// sale.entity.ts
@Entity({ tableName: 'sales' })
export class Sale {
  @PrimaryKey() saleId!: number;
  @ManyToOne(() => Customer, { fieldName: 'cus_id' }) customer!: Customer;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'sale_date', onCreate: () => new Date() }) saleDate = new Date();
  @Property({ type: 'decimal' }) total!: string;
  @Property({ fieldName: 'payment_method' }) paymentMethod!: string; // cash, transfer, qr
  @OneToMany(() => SaleDetail, d => d.sale) details = new Collection<SaleDetail>(this);
}

// sale-detail.entity.ts
@Entity({ tableName: 'sale_details' })
export class SaleDetail {
  @PrimaryKey() sdId!: number;
  @ManyToOne(() => Sale, { fieldName: 'sale_id' }) sale!: Sale;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ type: 'decimal' }) price!: string;
}
```

```ts
// reservation.entity.ts
@Entity({ tableName: 'reservations' })
export class Reservation {
  @PrimaryKey() resId!: number;
  @ManyToOne(() => Customer, { fieldName: 'cus_id' }) customer!: Customer;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'res_date', onCreate: () => new Date() }) resDate = new Date();
  @Property({ type: 'decimal', default: 0 }) deposit = '0';
  @Property({ default: 'booked' }) status = 'booked'; // booked, ready, completed, cancelled
  @OneToMany(() => ReservationDetail, d => d.reservation) details = new Collection<ReservationDetail>(this);
}

// reservation-detail.entity.ts
@Entity({ tableName: 'reservation_details' })
export class ReservationDetail {
  @PrimaryKey() rdId!: number;
  @ManyToOne(() => Reservation, { fieldName: 'res_id' }) reservation!: Reservation;
  @ManyToOne(() => Book, { fieldName: 'book_id' }) book!: Book;
  @Property() qty!: number;
  @Property({ type: 'decimal' }) price!: string;
}
```

> Decimal columns use `string` in TS to avoid float precision loss (MikroORM default for `decimal`).
## Key Decisions
- **Header + Details pattern** ສຳລັບທຸກທຸລະກຳ (ສັ່ງຊື້/ຂາຍ/ຈອງ) → ໜຶ່ງບິນມີຫຼາຍລາຍການ (parent + `details` Collection)
- **ແຍກ purchase_orders ກັບ imports** → ໃບສັ່ງຊື້ ≠ ການຮັບຂອງຈິງ (Import.order ເຊື່ອມກັນ)
- **stock ໃນ Book** → ບວກເມື່ອ import, ລົບເມື່ອ sale; ປ່ຽນຄ່າພາຍໃນ `em.transactional()`
- **OTP** → ເກັບແຄ່ otpVerified, ໂຕ OTP ຈັດການລະດັບ application (Redis/cache)
- **ລາຍງານ 6 ປະເພດ** → query ຈາກ entity ທີ່ມີຢູ່ ຜ່ານ EntityManager / QueryBuilder, ບໍ່ຕ້ອງສ້າງເພີ່ມ
- **Decimal → string** ໃນ TS ເພື່ອຫຼີກລ່ຽງ float precision loss

## Stock Logic (inside em.transactional)
| Event | Action |
|-------|--------|
| Import received | book.stock += qty ; PO.status = 'received' |
| Sale recorded | book.stock -= qty |
| Reservation booked | (optional) reserve qty |
