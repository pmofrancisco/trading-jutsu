import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type { DailyMover, DailyMovers } from './dto';
import { PSE_INDEX_SYMBOLS } from './pse-indices';

/**
 * Every stock that traded in the latest session, with the close it is measured
 * against.
 *
 * The session is the newest timestamp in the table rather than today's date, so
 * the page describes the data it actually has — over a weekend, or while the
 * upstream loader is behind, that is Friday's session and not an empty one. It
 * is the newest timestamp *among the stocks*: the indices are written by the
 * same loader we do not own, and were one of them ever to land ahead of the
 * stock bars, a session taken over the whole table would match no stock at all
 * and empty the page.
 *
 * `previous` deliberately takes each symbol's own last bar before that session
 * rather than the session before it: a stock that did not trade yesterday is
 * still up or down against whenever it last did, which is the change the PSE
 * itself quotes. The `LEFT JOIN` of the year-to-date query would be wrong here —
 * a symbol with no earlier bar has no change to rank, so an inner join drops it.
 *
 * Both `DISTINCT ON` and the latest-session lookup ride the unique
 * `(symbol, timestamp)` index, and `::float8` converts Postgres `numeric` —
 * which node-postgres would otherwise hand back as a string — into a
 * JavaScript number.
 */
const DAILY_MOVERS_SQL = `
  WITH session AS (
    SELECT max(timestamp) AS ts
    FROM market_data
    WHERE symbol <> ALL($1::text[])
  ),
  latest AS (
    SELECT m.symbol, m.close
    FROM market_data m, session s
    WHERE m.timestamp = s.ts AND m.symbol <> ALL($1::text[])
  ),
  previous AS (
    SELECT DISTINCT ON (m.symbol) m.symbol, m.close
    FROM market_data m, session s
    WHERE m.timestamp < s.ts AND m.symbol <> ALL($1::text[])
    ORDER BY m.symbol, m.timestamp DESC
  )
  SELECT
    l.symbol,
    l.close::float8 AS close,
    p.close::float8 AS previous_close,
    s.ts AS as_of
  FROM latest l
  JOIN previous p ON p.symbol = l.symbol,
  session s
  -- A zero previous close would divide to Infinity, which renders as a number
  -- and reads as a real move.
  WHERE p.close <> 0
`;

interface MoverRow {
  symbol: string;
  close: number;
  previous_close: number;
  as_of: Date;
}

/** Biggest move first, with the symbol breaking ties so the order is stable. */
function byMoveSize(a: DailyMover, b: DailyMover): number {
  const bySize = Math.abs(b.changePercent) - Math.abs(a.changePercent);

  return bySize !== 0 ? bySize : a.symbol.localeCompare(b.symbol);
}

export async function listDailyMovers(): Promise<DailyMovers> {
  await requireUser();

  const { rows } = await phStocksDb().query<MoverRow>(DAILY_MOVERS_SQL, [
    PSE_INDEX_SYMBOLS,
  ]);

  const movers = rows.map((row): DailyMover => {
    const change = row.close - row.previous_close;

    return {
      symbol: row.symbol,
      close: row.close,
      change,
      changePercent: (change / row.previous_close) * 100,
    };
  });

  return {
    // Every row carries the same session; with no rows there is none to name.
    asOf: rows[0]?.as_of ?? null,
    gainers: movers.filter((mover) => mover.change > 0).sort(byMoveSize),
    losers: movers.filter((mover) => mover.change < 0).sort(byMoveSize),
  };
}
