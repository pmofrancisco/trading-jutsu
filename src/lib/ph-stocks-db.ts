import 'server-only';

import { Pool } from 'pg';

/**
 * A read-only connection to the PH market data database.
 *
 * This is a second Postgres instance, separate from `DATABASE_URL`. Prisma
 * cannot hold two datasources in one schema, and `market_data` is owned and
 * migrated by another application — so this app reaches it with a plain pool
 * rather than a generated client that would invite `prisma migrate` to enforce
 * our schema against a table we do not control.
 *
 * Only a feature's data layer may import this, exactly as with `@/lib/prisma`.
 */

/**
 * Held on `globalThis` so the dev server's hot reload reuses one pool instead of
 * opening a new set of connections on every recompile — the endpoint is a shared
 * pooler with a connection cap, and leaked pools would exhaust it.
 */
const globalForPhStocksDb = globalThis as typeof globalThis & {
  phStocksPool?: Pool;
};

export function phStocksDb(): Pool {
  if (globalForPhStocksDb.phStocksPool) {
    return globalForPhStocksDb.phStocksPool;
  }

  const connectionString = process.env.PH_STOCKS_DATABASE_URL;

  // Checked here rather than at module scope so a missing variable fails the
  // request that needed the database, not `next build`.
  if (!connectionString) {
    throw new Error('PH_STOCKS_DATABASE_URL is not set.');
  }

  // `sslmode=require` in the connection string is enough — node-postgres reads
  // it, so there is no `ssl` option to set here.
  const pool = new Pool({ connectionString, max: 5 });

  // node-postgres emits `error` on the pool when an *idle* client's connection
  // drops — a pooler timing it out, a network blip. Node treats an unhandled
  // `error` event as fatal, so without this listener a dropped idle connection
  // would take the server down. The pool discards the client either way; there
  // is nothing to do here but decline to crash.
  pool.on('error', () => {});

  globalForPhStocksDb.phStocksPool = pool;

  return pool;
}
