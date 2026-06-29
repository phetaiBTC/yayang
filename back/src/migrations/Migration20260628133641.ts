import { Migration } from '@mikro-orm/migrations';

export class Migration20260628133641 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`book_types\` (\`type_id\` int unsigned not null auto_increment primary key, \`type_name\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`categories\` (\`cat_id\` int unsigned not null auto_increment primary key, \`cat_name\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`books\` (\`book_id\` int unsigned not null auto_increment primary key, \`title\` varchar(255) not null, \`cat_id\` int unsigned not null, \`type_id\` int unsigned not null, \`price\` numeric(10,0) not null, \`stock\` int not null default 0) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`books\` add index \`books_cat_id_index\`(\`cat_id\`);`);
    this.addSql(`alter table \`books\` add index \`books_type_id_index\`(\`type_id\`);`);

    this.addSql(`create table \`customers\` (\`cus_id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`phone\` varchar(255) null, \`otp_verified\` tinyint(1) not null default false, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`employees\` (\`emp_id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`phone\` varchar(255) null, \`username\` varchar(255) not null, \`password\` varchar(255) not null, \`role\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`employees\` add unique \`employees_username_unique\`(\`username\`);`);

    this.addSql(`create table \`reservations\` (\`res_id\` int unsigned not null auto_increment primary key, \`cus_id\` int unsigned not null, \`emp_id\` int unsigned not null, \`res_date\` datetime not null, \`deposit\` numeric(10,0) not null default 0, \`status\` varchar(255) not null default 'booked') default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`reservations\` add index \`reservations_cus_id_index\`(\`cus_id\`);`);
    this.addSql(`alter table \`reservations\` add index \`reservations_emp_id_index\`(\`emp_id\`);`);

    this.addSql(`create table \`reservation_details\` (\`rd_id\` int unsigned not null auto_increment primary key, \`res_id\` int unsigned not null, \`book_id\` int unsigned not null, \`qty\` int not null, \`price\` numeric(10,0) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`reservation_details\` add index \`reservation_details_res_id_index\`(\`res_id\`);`);
    this.addSql(`alter table \`reservation_details\` add index \`reservation_details_book_id_index\`(\`book_id\`);`);

    this.addSql(`create table \`sales\` (\`sale_id\` int unsigned not null auto_increment primary key, \`cus_id\` int unsigned not null, \`emp_id\` int unsigned not null, \`sale_date\` datetime not null, \`total\` numeric(10,0) not null, \`payment_method\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sales\` add index \`sales_cus_id_index\`(\`cus_id\`);`);
    this.addSql(`alter table \`sales\` add index \`sales_emp_id_index\`(\`emp_id\`);`);

    this.addSql(`create table \`sale_details\` (\`sd_id\` int unsigned not null auto_increment primary key, \`sale_id\` int unsigned not null, \`book_id\` int unsigned not null, \`qty\` int not null, \`price\` numeric(10,0) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sale_details\` add index \`sale_details_sale_id_index\`(\`sale_id\`);`);
    this.addSql(`alter table \`sale_details\` add index \`sale_details_book_id_index\`(\`book_id\`);`);

    this.addSql(`create table \`suppliers\` (\`sup_id\` int unsigned not null auto_increment primary key, \`sup_name\` varchar(255) not null, \`phone\` varchar(255) null, \`address\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`purchase_orders\` (\`po_id\` int unsigned not null auto_increment primary key, \`sup_id\` int unsigned not null, \`emp_id\` int unsigned not null, \`order_date\` datetime not null, \`status\` varchar(255) not null default 'pending') default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`purchase_orders\` add index \`purchase_orders_sup_id_index\`(\`sup_id\`);`);
    this.addSql(`alter table \`purchase_orders\` add index \`purchase_orders_emp_id_index\`(\`emp_id\`);`);

    this.addSql(`create table \`purchase_order_details\` (\`pod_id\` int unsigned not null auto_increment primary key, \`po_id\` int unsigned not null, \`book_id\` int unsigned not null, \`qty\` int not null, \`cost_price\` numeric(10,0) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`purchase_order_details\` add index \`purchase_order_details_po_id_index\`(\`po_id\`);`);
    this.addSql(`alter table \`purchase_order_details\` add index \`purchase_order_details_book_id_index\`(\`book_id\`);`);

    this.addSql(`create table \`imports\` (\`import_id\` int unsigned not null auto_increment primary key, \`po_id\` int unsigned not null, \`emp_id\` int unsigned not null, \`import_date\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`imports\` add index \`imports_po_id_index\`(\`po_id\`);`);
    this.addSql(`alter table \`imports\` add index \`imports_emp_id_index\`(\`emp_id\`);`);

    this.addSql(`create table \`import_details\` (\`imd_id\` int unsigned not null auto_increment primary key, \`import_id\` int unsigned not null, \`book_id\` int unsigned not null, \`qty\` int not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`import_details\` add index \`import_details_import_id_index\`(\`import_id\`);`);
    this.addSql(`alter table \`import_details\` add index \`import_details_book_id_index\`(\`book_id\`);`);

    this.addSql(`alter table \`books\` add constraint \`books_cat_id_foreign\` foreign key (\`cat_id\`) references \`categories\` (\`cat_id\`) on update cascade;`);
    this.addSql(`alter table \`books\` add constraint \`books_type_id_foreign\` foreign key (\`type_id\`) references \`book_types\` (\`type_id\`) on update cascade;`);

    this.addSql(`alter table \`reservations\` add constraint \`reservations_cus_id_foreign\` foreign key (\`cus_id\`) references \`customers\` (\`cus_id\`) on update cascade;`);
    this.addSql(`alter table \`reservations\` add constraint \`reservations_emp_id_foreign\` foreign key (\`emp_id\`) references \`employees\` (\`emp_id\`) on update cascade;`);

    this.addSql(`alter table \`reservation_details\` add constraint \`reservation_details_res_id_foreign\` foreign key (\`res_id\`) references \`reservations\` (\`res_id\`) on update cascade;`);
    this.addSql(`alter table \`reservation_details\` add constraint \`reservation_details_book_id_foreign\` foreign key (\`book_id\`) references \`books\` (\`book_id\`) on update cascade;`);

    this.addSql(`alter table \`sales\` add constraint \`sales_cus_id_foreign\` foreign key (\`cus_id\`) references \`customers\` (\`cus_id\`) on update cascade;`);
    this.addSql(`alter table \`sales\` add constraint \`sales_emp_id_foreign\` foreign key (\`emp_id\`) references \`employees\` (\`emp_id\`) on update cascade;`);

    this.addSql(`alter table \`sale_details\` add constraint \`sale_details_sale_id_foreign\` foreign key (\`sale_id\`) references \`sales\` (\`sale_id\`) on update cascade;`);
    this.addSql(`alter table \`sale_details\` add constraint \`sale_details_book_id_foreign\` foreign key (\`book_id\`) references \`books\` (\`book_id\`) on update cascade;`);

    this.addSql(`alter table \`purchase_orders\` add constraint \`purchase_orders_sup_id_foreign\` foreign key (\`sup_id\`) references \`suppliers\` (\`sup_id\`) on update cascade;`);
    this.addSql(`alter table \`purchase_orders\` add constraint \`purchase_orders_emp_id_foreign\` foreign key (\`emp_id\`) references \`employees\` (\`emp_id\`) on update cascade;`);

    this.addSql(`alter table \`purchase_order_details\` add constraint \`purchase_order_details_po_id_foreign\` foreign key (\`po_id\`) references \`purchase_orders\` (\`po_id\`) on update cascade;`);
    this.addSql(`alter table \`purchase_order_details\` add constraint \`purchase_order_details_book_id_foreign\` foreign key (\`book_id\`) references \`books\` (\`book_id\`) on update cascade;`);

    this.addSql(`alter table \`imports\` add constraint \`imports_po_id_foreign\` foreign key (\`po_id\`) references \`purchase_orders\` (\`po_id\`) on update cascade;`);
    this.addSql(`alter table \`imports\` add constraint \`imports_emp_id_foreign\` foreign key (\`emp_id\`) references \`employees\` (\`emp_id\`) on update cascade;`);

    this.addSql(`alter table \`import_details\` add constraint \`import_details_import_id_foreign\` foreign key (\`import_id\`) references \`imports\` (\`import_id\`) on update cascade;`);
    this.addSql(`alter table \`import_details\` add constraint \`import_details_book_id_foreign\` foreign key (\`book_id\`) references \`books\` (\`book_id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`books\` drop foreign key \`books_type_id_foreign\`;`);

    this.addSql(`alter table \`books\` drop foreign key \`books_cat_id_foreign\`;`);

    this.addSql(`alter table \`reservation_details\` drop foreign key \`reservation_details_book_id_foreign\`;`);

    this.addSql(`alter table \`sale_details\` drop foreign key \`sale_details_book_id_foreign\`;`);

    this.addSql(`alter table \`purchase_order_details\` drop foreign key \`purchase_order_details_book_id_foreign\`;`);

    this.addSql(`alter table \`import_details\` drop foreign key \`import_details_book_id_foreign\`;`);

    this.addSql(`alter table \`reservations\` drop foreign key \`reservations_cus_id_foreign\`;`);

    this.addSql(`alter table \`sales\` drop foreign key \`sales_cus_id_foreign\`;`);

    this.addSql(`alter table \`reservations\` drop foreign key \`reservations_emp_id_foreign\`;`);

    this.addSql(`alter table \`sales\` drop foreign key \`sales_emp_id_foreign\`;`);

    this.addSql(`alter table \`purchase_orders\` drop foreign key \`purchase_orders_emp_id_foreign\`;`);

    this.addSql(`alter table \`imports\` drop foreign key \`imports_emp_id_foreign\`;`);

    this.addSql(`alter table \`reservation_details\` drop foreign key \`reservation_details_res_id_foreign\`;`);

    this.addSql(`alter table \`sale_details\` drop foreign key \`sale_details_sale_id_foreign\`;`);

    this.addSql(`alter table \`purchase_orders\` drop foreign key \`purchase_orders_sup_id_foreign\`;`);

    this.addSql(`alter table \`purchase_order_details\` drop foreign key \`purchase_order_details_po_id_foreign\`;`);

    this.addSql(`alter table \`imports\` drop foreign key \`imports_po_id_foreign\`;`);

    this.addSql(`alter table \`import_details\` drop foreign key \`import_details_import_id_foreign\`;`);

    this.addSql(`drop table if exists \`book_types\`;`);

    this.addSql(`drop table if exists \`categories\`;`);

    this.addSql(`drop table if exists \`books\`;`);

    this.addSql(`drop table if exists \`customers\`;`);

    this.addSql(`drop table if exists \`employees\`;`);

    this.addSql(`drop table if exists \`reservations\`;`);

    this.addSql(`drop table if exists \`reservation_details\`;`);

    this.addSql(`drop table if exists \`sales\`;`);

    this.addSql(`drop table if exists \`sale_details\`;`);

    this.addSql(`drop table if exists \`suppliers\`;`);

    this.addSql(`drop table if exists \`purchase_orders\`;`);

    this.addSql(`drop table if exists \`purchase_order_details\`;`);

    this.addSql(`drop table if exists \`imports\`;`);

    this.addSql(`drop table if exists \`import_details\`;`);
  }

}
