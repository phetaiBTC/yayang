import 'dotenv/config';
import { MikroORM } from '@mikro-orm/mysql';
import * as bcrypt from 'bcryptjs';
import config from './mikro-orm.config';
import { Employee } from './entities';

const DEFAULT_PASSWORD = 'admin123';

/**
 * Idempotently create the first admin employee so that the admin-gated
 * master-data endpoints can be bootstrapped. No-op if an admin already exists.
 */
async function run() {
  const orm = await MikroORM.init(config);
  try {
    const em = orm.em.fork();

    const existing = await em.findOne(Employee, { role: 'admin' });
    if (existing) {
      console.log(`Admin already exists (username: "${existing.username}") — no changes made.`);
      return;
    }

    const username = process.env.SEED_ADMIN_USER ?? 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
    if (password === DEFAULT_PASSWORD) {
      console.warn(
        '⚠️  Using the default seed admin password. Set SEED_ADMIN_PASSWORD before deploying to production.',
      );
    }

    const admin = em.create(
      Employee,
      {
        name: 'Administrator',
        username,
        password: await bcrypt.hash(password, 10),
        role: 'admin',
      },
      { partial: true },
    );
    await em.persistAndFlush(admin);
    console.log(`✅ Created admin employee (username: "${username}", empId: ${admin.empId}).`);
  } finally {
    await orm.close(true);
  }
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
