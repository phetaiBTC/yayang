import { Migration } from '@mikro-orm/migrations';

export class Migration20260702050000_AddCustomerEmail extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`customers\` add \`email\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`customers\` drop column \`email\`;`);
  }

}
