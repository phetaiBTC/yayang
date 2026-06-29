import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as entities from './entities';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  dbName: process.env.DB_NAME ?? 'bookstore',
  entities: Object.values(entities),
  metadataProvider: TsMorphMetadataProvider,
  debug: process.env.NODE_ENV !== 'production',
  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
    snapshot: false,
  },
});
