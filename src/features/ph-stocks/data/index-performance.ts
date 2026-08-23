import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type { IndexPerformance, PeriodPerformance } from './dto';
import { PSE_INDEX_SYMBOLS, PSE_INDICES } from './pse-indices';

/**
 * Picks the most recent bar per symbol, plus the last bar before the start of
 * the year and the last one before the start of the quarter — the index's
 * closing levels for the previous year and the previous quarter, which
 * year-to-date and quarter-to-date are conventionally measured from.
 *
 * Both cut-offs come from the newest bar in the table rather than from the
 * server clock, so the figures always describe the period of the data being
 * displayed and do not depend on the server's time zone. In the first quarter
 * the two land on the same day and the two figures agree, which is simply what
 * quarter-to-date means in January.
 *
 * The baselines are `LEFT JOIN LATERAL` rather than a second `DISTINCT ON`: the
 * two differ only in the cut-off they compare against, and a lateral says that
 * once per cut-off instead of repeating a whole CTE with one word changed. Left,
 * because an index first tracked partway through the year has no bar before
 * January and must still come back with its latest level so the page can say so.
 * `LIMIT 1` on a descending scan of the unique `(symbol, timestamp)` index stops
 * at the first row, and `::float8` converts Postgres `numeric` — which
 * node-postgres would otherwise hand back as a string — into a JavaScript
 * number.
 */
const PERFORMANCE_SQL = `
  WITH latest AS (
    SELECT DISTINCT ON (symbol) symbol, timestamp, close
    FROM market_data
    WHERE symbol = ANY($1::text[])
    ORDER BY symbol, timestamp DESC
  ),
  bounds AS (
    SELECT
      date_trunc('year', newest.ts) AT TIME ZONE 'UTC' AS year_start,
      date_trunc('quarter', newest.ts) AT TIME ZONE 'UTC' AS quarter_start
    FROM (SELECT max(timestamp) AT TIME ZONE 'UTC' AS ts FROM latest) newest
  )
  SELECT
    l.symbol,
    l.timestamp AS as_of,
    l.close::float8 AS latest_close,
    y.timestamp AS year_baseline_date,
    y.close::float8 AS year_baseline_close,
    q.timestamp AS quarter_baseline_date,
    q.close::float8 AS quarter_baseline_close
  FROM latest l
  CROSS JOIN bounds b
  LEFT JOIN LATERAL (
    SELECT m.timestamp, m.close
    FROM market_data m
    WHERE m.symbol = l.symbol AND m.timestamp < b.year_start
    ORDER BY m.timestamp DESC
    LIMIT 1
  ) y ON true
  LEFT JOIN LATERAL (
    SELECT m.timestamp, m.close
    FROM market_data m
    WHERE m.symbol = l.symbol AND m.timestamp < b.quarter_start
    ORDER BY m.timestamp DESC
    LIMIT 1
  ) q ON true
`;

interface PerformanceRow {
  symbol: string;
  as_of: Date;
  latest_close: number;
  year_baseline_date: Date | null;
  year_baseline_close: number | null;
  quarter_baseline_date: Date | null;
  quarter_baseline_close: number | null;
}

/** One period's figures, from the level it starts at and the level it ends at. */
function toPeriodPerformance(
  latestClose: number | null,
  baselineClose: number | null,
  baselineDate: Date | null,
): PeriodPerformance {
  return {
    baselineClose,
    baselineDate,
    // A zero baseline is excluded alongside a missing one: dividing by it
    // yields Infinity, which would render as a number and read as real.
    changePercent:
      latestClose !== null && baselineClose !== null && baselineClose !== 0
        ? ((latestClose - baselineClose) / baselineClose) * 100
        : null,
  };
}

export async function listIndexPerformance(): Promise<IndexPerformance[]> {
  await requireUser();

  const { rows } = await phStocksDb().query<PerformanceRow>(PERFORMANCE_SQL, [
    PSE_INDEX_SYMBOLS,
  ]);

  const bySymbol = new Map(rows.map((row) => [row.symbol, row]));

  // Mapping over `PSE_INDICES` rather than over `rows` fixes the display order
  // here and keeps a symbol the query found nothing for from disappearing.
  return PSE_INDICES.map(({ symbol, name }) => {
    const row = bySymbol.get(symbol);
    const latestClose = row?.latest_close ?? null;

    return {
      symbol,
      name,
      latestClose,
      asOf: row?.as_of ?? null,
      periods: {
        ytd: toPeriodPerformance(
          latestClose,
          row?.year_baseline_close ?? null,
          row?.year_baseline_date ?? null,
        ),
        qtd: toPeriodPerformance(
          latestClose,
          row?.quarter_baseline_close ?? null,
          row?.quarter_baseline_date ?? null,
        ),
      },
    };
  });
}
