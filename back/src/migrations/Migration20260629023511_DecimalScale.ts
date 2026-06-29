import { Migration } from '@mikro-orm/migrations';

export class Migration20260629023511_DecimalScale extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`books\` modify \`price\` numeric(12,2) not null;`);

    this.addSql(`alter table \`reservations\` modify \`deposit\` numeric(12,2) not null default 0;`);

    this.addSql(`alter table \`reservation_details\` modify \`price\` numeric(12,2) not null;`);

    this.addSql(`alter table \`sales\` modify \`total\` numeric(12,2) not null;`);

    this.addSql(`alter table \`sale_details\` modify \`price\` numeric(12,2) not null;`);

    this.addSql(`alter table \`purchase_order_details\` modify \`cost_price\` numeric(12,2) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`books\` modify \`price\` decimal(10,0) not null;`);

    this.addSql(`alter table \`purchase_order_details\` modify \`cost_price\` decimal(10,0) not null;`);

    this.addSql(`alter table \`reservation_details\` modify \`price\` decimal(10,0) not null;`);

    this.addSql(`alter table \`reservations\` modify \`deposit\` decimal(10,0) not null default 0;`);

    this.addSql(`alter table \`sale_details\` modify \`price\` decimal(10,0) not null;`);

    this.addSql(`alter table \`sales\` modify \`total\` decimal(10,0) not null;`);
  }

}
