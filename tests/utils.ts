import { Application } from '@adonisjs/application';
import { Emitter } from '@adonisjs/core/events';
import { Logger } from '@adonisjs/core/logger';
import { Database } from '@adonisjs/lucid/database';
import { MigrationRunner } from '@adonisjs/lucid/migration';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BaseModel } from '@adonisjs/lucid/orm';
import { ModelNode } from '../src/types.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

export let db: Database;
export let app: Application<Record<any, any>>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupLucid() {
  app = new Application(new URL(__dirname, import.meta.url), {
    environment: 'test',
  });

  const logger = new Logger({ enabled: false, name: 'lucid' });
  const emitter = new Emitter(app);

  const dbDriver =
    (process.env.DRIVER as
      | 'pg'
      | 'postgres'
      | 'postgresql'
      | 'sqlite'
      | 'sqlite3'
      | 'better-sqlite3'
      | 'libsql'
      | 'mysql'
      | 'mysql2'
      | 'oracledb'
      | 'mssql') || 'pg';

  const connectionConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  db = new Database(
    {
      connection: dbDriver,
      connections: {
        [dbDriver]: {
          client: 'pg' as const,
          connection: connectionConfig,
          migrations: {
            naturalSort: true,
            paths: ['database/migrations'],
          },
          debug: true,
        },
      },
    },
    logger,
    emitter
  );

  db.connection('pg');
  BaseModel.useAdapter(db.modelAdapter());
  return db;
}

export async function runMigrations() {
  const runner = new MigrationRunner(db, app, {
    direction: 'up',
  });

  await runner.run();
  console.log('Migrations have been run.');
}

function topologicalSort(models: ModelNode[]): ModelNode[] {
  const sorted: ModelNode[] = [];
  const visited = new Set<typeof BaseModel>();

  function visit(node: ModelNode) {
    if (!visited.has(node.model)) {
      visited.add(node.model);
      node.dependencies.forEach(visit);
      sorted.push(node);
    }
  }

  models.forEach(visit);
  return sorted;
}

export async function truncateAllTables() {
  const entitiesPath = join(__dirname, 'entities');
  const files = await fs.readdir(entitiesPath);
  const models: ModelNode[] = [];

  for (const file of files) {
    if (file.endsWith('.ts')) {
      const { default: model } = await import(`./entities/${file}`);
      models.push({ model, dependencies: [] });
    }
  }

  const sortedModels = topologicalSort(models);

  for (const { model } of sortedModels) {
    const tableName = model.table;
    await db.rawQuery(`TRUNCATE TABLE "${tableName}" CASCADE`);
  }

  console.info('All tables truncated.');
}
