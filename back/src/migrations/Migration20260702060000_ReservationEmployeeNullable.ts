import { Migration } from '@mikro-orm/migrations';

export class Migration20260702060000_ReservationEmployeeNullable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`reservations\` modify \`emp_id\` int unsigned null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`reservations\` modify \`emp_id\` int unsigned not null;`);
  }

}
