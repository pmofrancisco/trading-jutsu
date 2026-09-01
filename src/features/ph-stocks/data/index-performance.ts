import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { phStocksLogoUrl } from '@/lib/ph-stocks-assets';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type {
  IndexPerformance,
  PeriodPerformance,
  PerformancePeriod,
} from './dto';
import { PERIOD_KEYS, PERIOD_UNITS } from './periods';
import { PSE_INDEX_SYMBOLS, PSE_INDICES } from './pse-indices';

/**
 * Picks the most recent bar per symbol, and then, for each period, the last bar
 * before that period began — the index's closing level for the previous year,
 * quarter, month or week, which the to-date figures are conventionally measured
 * from. One row comes back per index per period.
 *
 * Every cut-off comes from the newest bar in the table rather than from the
 * server clock, so the figures always describe the period of the data being
 * displayed and do not depend on the server's time zone. In January the year,
 * quarter and month cut-offs land on the same day and those three figures agree,
 * which is simply what quarter-to-date and month-to-date mean in January; the
 * same happens to the month and the week whenever a month begins on a Monday.
 *
 * The periods arrive as parallel `text[]` parameters and are unnested into rows
 * rather than written out as a lateral each: the windows differ only in the
 * cut-off they compare against, so one lateral over a list of cut-offs says once
 * what three copies would say three times with one word changed. It is left,
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
  periods AS (
    SELECT
      p.period,
      date_trunc(p.unit, newest.ts) AT TIME ZONE 'UTC' AS start
    FROM (SELECT max(timestamp) AT TIME ZONE 'UTC' AS ts FROM latest) newest
    CROSS JOIN unnest($2::text[], $3::text[]) AS p(period, unit)
  )
  SELECT
    l.symbol,
    p.period,
    l.timestamp AS as_of,
    l.close::float8 AS latest_close,
    b.timestamp AS baseline_date,
    b.close::float8 AS baseline_close
  FROM latest l
  CROSS JOIN periods p
  LEFT JOIN LATERAL (
    SELECT m.timestamp, m.close
    FROM market_data m
    WHERE m.symbol = l.symbol AND m.timestamp < p.start
    ORDER BY m.timestamp DESC
    LIMIT 1
  ) b ON true
`;

/**
 * One index measured over one period. The latest bar repeats across a symbol's
 * rows — it is the same bar every period is measured to.
 */
interface PerformanceRow {
  symbol: string;
  period: PerformancePeriod;
  as_of: Date;
  latest_close: number;
  baseline_date: Date | null;
  baseline_close: number | null;
}

/** One period's figures, from the level it starts at and the level it ends at. */
function toPeriodPerformance(
  latestClose: number | null,
  row: PerformanceRow | undefined,
): PeriodPerformance {
  const baselineClose = row?.baseline_close ?? null;

  return {
    baselineClose,
    baselineDate: row?.baseline_date ?? null,
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
    PERIOD_KEYS,
    PERIOD_UNITS,
  ]);

  const rowsBySymbol = new Map<string, PerformanceRow[]>();

  for (const row of rows) {
    const symbolRows = rowsBySymbol.get(row.symbol);

    if (symbolRows) {
      symbolRows.push(row);
    } else {
      rowsBySymbol.set(row.symbol, [row]);
    }
  }

  // Mapping over `PSE_INDICES` rather than over `rows` fixes the display order
  // here and keeps a symbol the query found nothing for from disappearing.
  return PSE_INDICES.map(({ symbol, name }) => {
    const symbolRows = rowsBySymbol.get(symbol) ?? [];
    // Any of the symbol's rows carries its latest bar; they only differ in what
    // that bar is measured from.
    const [anyPeriod] = symbolRows;
    const latestClose = anyPeriod?.latest_close ?? null;
    const byPeriod = new Map(symbolRows.map((row) => [row.period, row]));

    return {
      symbol,
      name,
      logoUrl: phStocksLogoUrl(symbol),
      latestClose,
      asOf: anyPeriod?.as_of ?? null,
      // Written out rather than built from `PERIOD_KEYS` so the record stays
      // exhaustively typed: a window added to `PerformancePeriod` is a type
      // error here until it is produced.
      periods: {
        ytd: toPeriodPerformance(latestClose, byPeriod.get('ytd')),
        qtd: toPeriodPerformance(latestClose, byPeriod.get('qtd')),
        mtd: toPeriodPerformance(latestClose, byPeriod.get('mtd')),
        wtd: toPeriodPerformance(latestClose, byPeriod.get('wtd')),
      },
    };
  });
}
