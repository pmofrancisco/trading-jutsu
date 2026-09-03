import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { cryptoFallbackLogoUrl, cryptoLogoUrl } from '@/lib/crypto-assets';
import { cryptoDb } from '@/lib/crypto-db';
import type { PeriodLeader, PeriodLeaders, PerformancePeriod } from './dto';
import { PERIOD_KEYS, PERIOD_UNITS } from './periods';

/**
 * How far down each period's ranking the page goes. A leaderboard is a cut of
 * the market, not the whole of it: this table carries some four hundred coins,
 * so four unbounded rankings would send the entire board over the wire four
 * times to show the top of it. Both stock pages cut at the same fifty.
 */
export const LEADERS_LIMIT = 50;

/**
 * The coins that closed in the latest day, ranked by how far they have risen
 * since the start of each period.
 *
 * "The day" rather than "the session": crypto never closes, and this table
 * holds one bar per coin per UTC day rather than one per trading session. That
 * is why the CTE the stock markets call `session` is `newest` here, as it is in
 * `daily-movers`.
 *
 * That day is taken the way `daily-movers` takes it — the newest timestamp in
 * the table — rather than each symbol's own newest bar: this ranks the whole
 * board, and a coin last quoted in March would otherwise carry its March gain
 * into a ranking dated today and sit at the top of it. Confining the ranking to
 * one day also gives the page a single date to name. As in `daily-movers`,
 * there is no index symbol to exclude the way the PH query must — this database
 * holds coins and nothing else.
 *
 * The cut-offs come from that day rather than from the server clock, so the
 * windows describe the period of the data being displayed and do not depend on
 * the server's time zone. `UTC` is the zone they are truncated in, the way the
 * PH query truncates in its own: the loader stamps every bar at midnight UTC,
 * so a window truncated in any other zone would open a day early or late. In
 * January the year, quarter and month cut-offs land on the same day and those
 * three rankings agree, which is what quarter-to-date and month-to-date mean in
 * January.
 *
 * The baseline join is inner: a coin with nothing to measure against — or
 * nothing recent enough to be the window's opening level, see the bound inside
 * the join — has no place in a ranking at all. `row_number()` cuts each period
 * to `LEADERS_LIMIT` inside the query, so only the rows that are displayed are
 * built and returned.
 *
 * Only gains are ranked. A board of the smallest losses is a different page
 * from the one this heading promises, so a symbol that is flat or down over a
 * window drops out of that window's ranking rather than filling the bottom of
 * it. A ranking is therefore as long as the window has gainers, up to
 * `LEADERS_LIMIT`, and empty in a window nothing on the board rose over.
 *
 * `::float8` converts Postgres `numeric` — which node-postgres would otherwise
 * hand back as a string — into a JavaScript number.
 */
const PERIOD_LEADERS_SQL = `
  WITH newest AS (
    SELECT max(timestamp) AS ts
    FROM market_data
  ),
  latest AS (
    SELECT m.symbol, m.close
    FROM market_data m, newest s
    WHERE m.timestamp = s.ts
  ),
  periods AS (
    SELECT
      p.period,
      date_trunc(p.unit, s.ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS start
    FROM newest s
    CROSS JOIN unnest($1::text[], $2::text[]) AS p(period, unit)
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
        -- somewhere before it. Unbounded, the last bar of a coin that stopped
        -- being quoted — or any bar on the far side of a hole in the table's
        -- history — would be taken as the window's opening level and the
        -- ranking would measure a move the period never contained: a
        -- quarter-to-date column built from January closes reads as a quarter
        -- and is a year. Where the stock markets bound this at the longest a
        -- board realistically closes for, here it is the longest the loader can
        -- realistically be down: crypto has a bar for every day, so the
        -- baseline is the day before the window opens and anything older than a
        -- week is a gap. A coin whose last bar precedes one drops out of that
        -- one ranking rather than being ranked on a figure that is not what its
        -- label says.
        AND m.timestamp >= p.start - interval '7 days'
      ORDER BY m.timestamp DESC
      LIMIT 1
    ) b ON true
    -- A zero baseline would divide to Infinity, which sorts above every real
    -- move and would head the ranking.
    WHERE b.close <> 0
      -- A leader has to have led: a flat or falling symbol is not one, however
      -- near the top of a falling board it sits. The same expression the window
      -- orders by, so what is ranked and what is kept cannot disagree.
      --
      -- Both tests sit before row_number() rather than after it, because
      -- Postgres applies WHERE first and the rank must not count a row the page
      -- never shows: filtered afterwards, a window whose three biggest movers
      -- were all losses would open at rank 4.
      AND (l.close - b.close) / b.close > 0
  )
  SELECT r.period, r.symbol, r.close, r.change_percent, s.ts AS as_of
  FROM ranked r, newest s
  WHERE r.rank <= $3
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

  const { rows } = await cryptoDb().query<LeaderRow>(PERIOD_LEADERS_SQL, [
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
      logoUrl: cryptoLogoUrl(row.symbol),
      close: row.close,
      changePercent: row.change_percent,
    });
  }

  return {
    // Every row carries the same day; with no rows there is none to name.
    asOf: rows[0]?.as_of ?? null,
    // One value for the whole market, so it is resolved here rather
    // than per row — see `fallbackLogoUrl` on the DTO.
    fallbackLogoUrl: cryptoFallbackLogoUrl(),
    periods,
  };
}
