import { Migration } from '@mikro-orm/migrations';

export class Migration20260702080000_AddBookImage extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`books\` add \`image\` varchar(500) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`books\` drop column \`image\`;`);
  }

}
