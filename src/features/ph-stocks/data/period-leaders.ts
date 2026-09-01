import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import {
  phStocksFallbackLogoUrl,
  phStocksLogoUrl,
} from '@/lib/ph-stocks-assets';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type { PeriodLeader, PeriodLeaders, PerformancePeriod } from './dto';
import { PERIOD_KEYS, PERIOD_UNITS } from './periods';
import { PSE_INDEX_SYMBOLS } from './pse-indices';

/**
 * How far down each period's ranking the page goes. A leaderboard is a cut of
 * the market, not the whole of it: the PSE lists a few hundred stocks, and four
 * unbounded rankings would send the entire board over the wire four times to
 * show the top of it.
 */
export const LEADERS_LIMIT = 50;

/**
 * The stocks that traded in the latest session, ranked by how far they have
 * come since the start of each period.
 *
 * The session is taken the way `daily-movers` takes it — the newest timestamp
 * among the stocks — and not, as `index-performance` does, each symbol's own
 * newest bar. The difference matters here in a way it does not there: that page
 * prices seven indices that are always quoted, while this one ranks the whole
 * board, and a stock suspended in March would otherwise carry its March gain
 * into a ranking dated today and sit at the top of it. Confining the ranking to
 * one session also gives the page a single date to name.
 *
 * The cut-offs come from that session rather than from the server clock, so the
 * windows describe the period of the data being displayed and do not depend on
 * the server's time zone. In January the year, quarter and month cut-offs land
 * on the same day and those three rankings agree, which is what
 * quarter-to-date and month-to-date mean in January.
 *
 * The baseline join is inner, unlike the `LEFT JOIN LATERAL` of
 * `index-performance`: an index with no bar before January must still appear so
 * the page can say it cannot be priced, but a stock with nothing to measure
 * against — or nothing recent enough to be the window's opening level, see the
 * bound inside the join — has no place in a ranking at all. `row_number()` cuts each period to
 * `LEADERS_LIMIT` inside the query, so only the rows that are displayed are
 * built and returned.
 *
 * `::float8` converts Postgres `numeric` — which node-postgres would otherwise
 * hand back as a string — into a JavaScript number.
 */
const PERIOD_LEADERS_SQL = `
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
  periods AS (
    SELECT
      p.period,
      date_trunc(p.unit, s.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS start
    FROM session s
    CROSS JOIN unnest($2::text[], $3::text[]) AS p(period, unit)
  ),
  ranked AS (
    SELECT
      p.period,
      l.symbol,
      l.close::float8 AS close,
      ((l.close - b.close) / b.close * 100)::float8 AS change_percent,
      row_number() OVER (
        PARTITION BY p.period
        ORDER BY (l.close - b.close) / b.close DESC, l.symbol
      ) AS rank
    FROM latest l
    CROSS JOIN periods p
    JOIN LATERAL (
      SELECT m.close
      FROM market_data m
      WHERE m.symbol = l.symbol
        AND m.timestamp < p.start
        -- The baseline has to sit just before the window opens, not merely
        -- somewhere before it. Unbounded, the last bar of a symbol that stopped
        -- trading — or any bar on the far side of a hole in the table's history
        -- — would be taken as the window's opening level and the ranking would
        -- measure a move the period never contained: a quarter-to-date column
        -- built from January closes reads as a quarter and is a year. Seven
        -- days is the longest a board realistically closes for, so a baseline
        -- older than that means the window cannot be measured at all, and the
        -- symbol drops out of that one ranking rather than being ranked on a
        -- figure that is not what its label says.
        AND m.timestamp >= p.start - interval '7 days'
      ORDER BY m.timestamp DESC
      LIMIT 1
    ) b ON true
    -- A zero baseline would divide to Infinity, which sorts above every real
    -- move and would head the ranking. Filtered here rather than after the
    -- window, because Postgres applies WHERE before row_number() and the rank
    -- must not count a row the page never shows.
    WHERE b.close <> 0
  )
  SELECT r.period, r.symbol, r.close, r.change_percent, s.ts AS as_of
  FROM ranked r, session s
  WHERE r.rank <= $4
  ORDER BY r.period, r.rank
`;

interface LeaderRow {
  period: PerformancePeriod;
  symbol: string;
  close: number;
  change_percent: number;
  as_of: Date;
}

export async function listPeriodLeaders(): Promise<PeriodLeaders> {
  await requireUser();

  const { rows } = await phStocksDb().query<LeaderRow>(PERIOD_LEADERS_SQL, [
    PSE_INDEX_SYMBOLS,
    PERIOD_KEYS,
    PERIOD_UNITS,
    LEADERS_LIMIT,
  ]);

  // Written out rather than built from `PERIOD_KEYS` so the record stays
  // exhaustively typed: a window added to `PerformancePeriod` is a type error
  // here until it is given a list of its own.
  const periods: Record<PerformancePeriod, PeriodLeader[]> = {
    ytd: [],
    qtd: [],
    mtd: [],
    wtd: [],
  };

  // The rows arrive in rank order within each period, so appending preserves
  // the ranking the query established and no list is sorted twice.
  for (const row of rows) {
    periods[row.period].push({
      symbol: row.symbol,
      logoUrl: phStocksLogoUrl(row.symbol),
      close: row.close,
      changePercent: row.change_percent,
    });
  }

  return {
    // Every row carries the same session; with no rows there is none to name.
    asOf: rows[0]?.as_of ?? null,
    // One value for the whole market, so it is resolved here rather
    // than per row — see `fallbackLogoUrl` on the DTO.
    fallbackLogoUrl: phStocksFallbackLogoUrl(),
    periods,
  };
}
