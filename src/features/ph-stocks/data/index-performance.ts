import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type { IndexPerformance } from './dto';
import { PSE_INDEX_SYMBOLS, PSE_INDICES } from './pse-indices';

/**
 * Picks two bars per symbol: the most recent one, and the last one before the
 * start of that year — the index's closing level for the previous year, which
 * is the level year-to-date is conventionally measured from.
 *
 * The year comes from the newest bar in the table rather than from the server
 * clock, so the figure always describes the year of the data being displayed and
 * does not depend on the server's time zone.
 *
 * `LEFT JOIN` is deliberate: an index first tracked partway through the year has
 * no bar before January, and must still come back with its latest level so the
 * page can say so. Both `DISTINCT ON`s ride the unique `(symbol, timestamp)`
 * index, and `::float8` converts Postgres `numeric` — which node-postgres would
 * otherwise hand back as a string — into a JavaScript number.
 */
const YTD_PERFORMANCE_SQL = `
  WITH latest AS (
    SELECT DISTINCT ON (symbol) symbol, timestamp, close
    FROM market_data
    WHERE symbol = ANY($1::text[])
    ORDER BY symbol, timestamp DESC
  ),
  year_start AS (
    SELECT date_trunc('year', max(timestamp) AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS ts
    FROM latest
  ),
  baseline AS (
    SELECT DISTINCT ON (m.symbol) m.symbol, m.timestamp, m.close
    FROM market_data m, year_start y
    WHERE m.symbol = ANY($1::text[]) AND m.timestamp < y.ts
    ORDER BY m.symbol, m.timestamp DESC
  )
  SELECT
    l.symbol,
    l.timestamp AS as_of,
    l.close::float8 AS latest_close,
    b.timestamp AS baseline_date,
    b.close::float8 AS baseline_close
  FROM latest l
  LEFT JOIN baseline b ON b.symbol = l.symbol
`;

interface PerformanceRow {
  symbol: string;
  as_of: Date;
  latest_close: number;
  baseline_date: Date | null;
  baseline_close: number | null;
}

export async function listIndexPerformance(): Promise<IndexPerformance[]> {
  await requireUser();

  const { rows } = await phStocksDb().query<PerformanceRow>(
    YTD_PERFORMANCE_SQL,
    [PSE_INDEX_SYMBOLS],
  );

  const bySymbol = new Map(rows.map((row) => [row.symbol, row]));

  // Mapping over `PSE_INDICES` rather than over `rows` fixes the display order
  // here and keeps a symbol the query found nothing for from disappearing.
  return PSE_INDICES.map(({ symbol, name }) => {
    const row = bySymbol.get(symbol);
    const latestClose = row?.latest_close ?? null;
    const baselineClose = row?.baseline_close ?? null;

    return {
      symbol,
      name,
      latestClose,
      asOf: row?.as_of ?? null,
      baselineClose,
      baselineDate: row?.baseline_date ?? null,
      // A zero baseline is excluded alongside a missing one: dividing by it
      // yields Infinity, which would render as a number and read as real.
      ytdPercent:
        latestClose !== null && baselineClose !== null && baselineClose !== 0
          ? ((latestClose - baselineClose) / baselineClose) * 100
          : null,
    };
  });
}
