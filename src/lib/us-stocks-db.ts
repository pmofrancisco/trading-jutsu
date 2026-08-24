import 'server-only';

import { Pool } from 'pg';

/**
 * A read-only connection to the US market data database.
 *
 * A second market, and a second database: `market_data` here holds the same
 * columns as the PH table of that name but is a wholly separate instance with
 * its own symbols and its own sessions, so the two never share a pool. It is
 * owned and migrated by another application, so this app reaches it with a
 * plain pool and hand-written SQL rather than a generated client — nothing here
 * should be able to enforce a schema against a table we do not control.
 *
 * Only a feature's data layer may import this.
 */

/**
 * Held on `globalThis` so the dev server's hot reload reuses one pool instead of
 * opening a new set of connections on every recompile — the endpoint is a shared
 * pooler with a connection cap, and leaked pools would exhaust it.
 */
const globalForUsStocksDb = globalThis as typeof globalThis & {
  usStocksPool?: Pool;
};

export function usStocksDb(): Pool {
  if (globalForUsStocksDb.usStocksPool) {
    return globalForUsStocksDb.usStocksPool;
  }

  const connectionString = process.env.US_STOCKS_DATABASE_URL;

  // Checked here rather than at module scope so a missing variable fails the
  // request that needed the database, not `next build`.
  if (!connectionString) {
    throw new Error('US_STOCKS_DATABASE_URL is not set.');
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

  globalForUsStocksDb.usStocksPool = pool;

  return pool;
}
