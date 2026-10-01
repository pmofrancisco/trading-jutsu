import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import {
  phStocksFallbackLogoUrl,
  phStocksLogoUrl,
} from '@/lib/ph-stocks-assets';
import { phStocksDb } from '@/lib/ph-stocks-db';
import type {
  PeriodLeaders,
  PeriodSpan,
  PeriodWindow,
  PerformancePeriod,
} from './dto';
import { PERIOD_KEYS, PERIOD_SPANS, PERIOD_UNITS } from './periods';
import { PSE_INDEX_SYMBOLS } from './pse-indices';

/**
 * The stocks ranked by how far they rose over each period — the turn in
 * progress, and the turn before it.
 *
 * The session is taken the way `daily-movers` takes it — the newest timestamp
 * among the stocks — and not, as `index-performance` does, each symbol's own
 * newest bar. The difference matters here in a way it does not there: that page
 * prices seven indices that are always quoted, while this one ranks the whole
 * board, and a stock suspended in March would otherwise carry its March gain
 * into a ranking dated today and sit at the top of it. `latest` is therefore
 * the universe every window ranks, whichever turn it measures.
 *
 * The index symbols are excluded wherever the board is read — the session, the
 * universe, and the probe behind `measurable` — because an index is not a stock
 * and has no place in a ranking of them, and because a day on which only an
 * index was quoted is not a day this board traded.
 *
 * The cut-offs come from that session rather than from the server clock, so the
 * windows describe the period of the data being displayed and do not depend on
 * the server's time zone. In January the year, quarter and month cut-offs land
 * on the same day and those three rankings agree, which is what
 * quarter-to-date and month-to-date mean in January.
 *
 * Eight windows in one query rather than four and another four on demand,
 * because the page switches between them without fetching — see
 * `PeriodTabsRoot`. The spans cross the periods rather than extending them: the
 * previous turn of a window opens where `date_trunc` lands a day before the
 * current turn does, which is one expression for all four units. A day back
 * from the first instant of a period is always inside the period before it, so
 * truncating again gives that period's own start — 1 Jan 2026 to 1 Jan 2025,
 * 1 Jul to 1 Apr, and the Monday of a week to the Monday before. Postgres has
 * no `interval '1 quarter'` to subtract, and this needs none.
 *
 * Both ends of a window are looked up, where the current-only query needed one.
 * A current span closes at the latest session, which `latest` already holds; a
 * previous span closes at the last bar before the current turn opened, which
 * nothing else knows. Asking for both the same way costs a second lateral on
 * the current spans whose answer is the bar `latest` is built from, and is
 * worth it: the alternative branches the join on the span and reads as two
 * queries stitched together.
 *
 * Both laterals carry the same seven-day bound, and for the same reason. The
 * level has to sit just at the window's edge, not merely somewhere beyond it.
 * Unbounded, the last bar of a symbol that stopped trading — or any bar on the
 * far side of a hole in the table's history — would be taken as the window's
 * opening level and the ranking would measure a move the period never
 * contained: a quarter-to-date column built from January closes reads as a
 * quarter and is a year. The closing level needs the bound just as much now
 * that a window can end in the past, for the mirror of the same reason: a stock
 * suspended in March 2025 would otherwise be ranked on a March close under a
 * heading reading 2025, which is a year that is really a quarter. Seven days is
 * the longest a board realistically closes for, so a level older than that
 * means the window cannot be measured at that end at all, and the symbol drops
 * out of that one ranking rather than being ranked on a figure that is not what
 * its label says.
 *
 * `measurable` answers a question an empty ranking cannot. This database keeps
 * a rolling window of recent sessions rather than the whole history, so a
 * period far enough back has no opening level for *any* stock and ranks nothing
 * — which is not a board on which nothing gained. One `EXISTS` per window,
 * eight index probes in all, is enough to tell the two apart, and the page says
 * whichever is true rather than blaming the market for both.
 *
 * The final join is `LEFT`, as `index-performance`'s baseline join is and for
 * the same reason one level up: a stock with nothing to measure against has no
 * place in a ranking, but a *window* with nothing in it must still come back,
 * or the page would have no dates to name the period by and no toggle to offer.
 *
 * Only gains are ranked. A board of the smallest losses is a different page
 * from the one this heading promises, so a symbol that is flat or down over a
 * window drops out of that window's ranking rather than filling the bottom of
 * it. A ranking is therefore as long as the window has gainers, and empty in
 * a window nothing on the board rose over.
 *
 * Nothing cuts it short. The page shows fifty rows at a time and turns
 * through the rest in the browser — see `LeadersTable` — so each ranking is
 * sent whole, once, and a page further down it costs no query. This board is
 * small enough to send that way; the US one is not, and still cuts.
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
    SELECT m.symbol
    FROM market_data m, session s
    WHERE m.timestamp = s.ts AND m.symbol <> ALL($1::text[])
  ),
  bounds AS (
    SELECT
      p.period,
      sp.span,
      (CASE
         WHEN sp.span = 'current' THEN c.starts_at
         ELSE date_trunc(p.unit, c.starts_at - interval '1 day')
       END) AT TIME ZONE 'UTC' AS starts_at,
      (CASE
         WHEN sp.span = 'current' THEN s.ts
         ELSE (c.starts_at AT TIME ZONE 'UTC') - interval '1 microsecond'
       END) AS ends_at
    FROM session s
    CROSS JOIN unnest($2::text[], $3::text[]) AS p(period, unit)
    CROSS JOIN unnest($4::text[]) AS sp(span)
    -- The current turn's opening, named once so the previous turn can be
    -- measured back from it and the two cannot drift apart.
    CROSS JOIN LATERAL (
      SELECT date_trunc(p.unit, s.ts AT TIME ZONE 'UTC') AS starts_at
    ) c
  ),
  periods AS (
    SELECT
      b.period,
      b.span,
      b.starts_at,
      b.ends_at,
      -- The calendar the window opens in, extracted in the zone it was
      -- truncated in so the two can only ever agree.
      extract(year FROM b.starts_at AT TIME ZONE 'UTC')::int AS year,
      extract(month FROM b.starts_at AT TIME ZONE 'UTC')::int AS month,
      EXISTS (
        SELECT 1
        FROM market_data m
        WHERE m.timestamp >= b.starts_at - interval '7 days'
          AND m.timestamp < b.starts_at
          AND m.symbol <> ALL($1::text[])
      ) AS measurable
    FROM bounds b
  ),
  ranked AS (
    SELECT
      p.period,
      p.span,
      l.symbol,
      e.close::float8 AS close,
      ((e.close - b.close) / b.close * 100)::float8 AS change_percent,
      row_number() OVER (
        PARTITION BY p.period, p.span
        ORDER BY (e.close - b.close) / b.close DESC, l.symbol
      ) AS rank
    FROM latest l
    CROSS JOIN periods p
    -- The level the window closes at.
    JOIN LATERAL (
      SELECT m.close
      FROM market_data m
      WHERE m.symbol = l.symbol
        AND m.timestamp <= p.ends_at
        AND m.timestamp > p.ends_at - interval '7 days'
      ORDER BY m.timestamp DESC
      LIMIT 1
    ) e ON true
    -- The level it opens from.
    JOIN LATERAL (
      SELECT m.close
      FROM market_data m
      WHERE m.symbol = l.symbol
        AND m.timestamp < p.starts_at
        AND m.timestamp >= p.starts_at - interval '7 days'
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
      AND (e.close - b.close) / b.close > 0
  )
  SELECT
    p.period,
    p.span,
    p.starts_at,
    p.year,
    p.month,
    p.measurable,
    s.ts AS as_of,
    r.symbol,
    r.close,
    r.change_percent
  FROM periods p
  CROSS JOIN session s
  LEFT JOIN ranked r
    ON r.period = p.period AND r.span = p.span
  ORDER BY p.period, p.span, r.rank
`;

/**
 * One row of the result: a window, and at most one of its ranked stocks.
 *
 * The window's own columns repeat down its rows, and the symbol columns are
 * null on the single row a window with nothing ranked comes back as — see the
 * `LEFT JOIN` above.
 */
interface LeaderRow {
  period: PerformancePeriod;
  span: PeriodSpan;
  starts_at: Date;
  year: number;
  month: number;
  measurable: boolean;
  /**
   * Null — along with `starts_at`, `year` and `month` — only when the board
   * holds no bars at all, because every window is then truncated from a session
   * that does not exist. Those three are typed as though they were not, because
   * `listPeriodLeaders` returns before reading one: they are non-null exactly
   * when this is.
   */
  as_of: Date | null;
  symbol: string | null;
  close: number | null;
  change_percent: number | null;
}

export async function listPeriodLeaders(): Promise<PeriodLeaders> {
  await requireUser();

  const { rows } = await phStocksDb().query<LeaderRow>(PERIOD_LEADERS_SQL, [
    PSE_INDEX_SYMBOLS,
    PERIOD_KEYS,
    PERIOD_UNITS,
    PERIOD_SPANS,
  ]);

  // One value for the whole market, so it is resolved here rather than per row
  // — see `fallbackLogoUrl` on the DTO.
  const fallbackLogoUrl = phStocksFallbackLogoUrl();

  // The eight windows are crossed from the parameters rather than built from
  // the data, so they come back even from a board that has none — a row count
  // says nothing here. What says the table is empty is the session itself,
  // which is null exactly when there was no bar to take it from.
  const asOf = rows[0]?.as_of ?? null;

  if (asOf === null) {
    return { asOf: null, fallbackLogoUrl, periods: null };
  }

  // Keyed on the pair the query partitions by, so a row finds its window
  // without either union having to be traversed.
  const windows = new Map<string, PeriodWindow>();

  // The rows arrive in rank order within each window, so appending preserves
  // the ranking the query established and no list is sorted twice.
  for (const row of rows) {
    const key = `${row.period}/${row.span}`;
    let window = windows.get(key);

    if (!window) {
      window = {
        start: row.starts_at,
        year: row.year,
        month: row.month,
        measurable: row.measurable,
        leaders: [],
      };
      windows.set(key, window);
    }

    // Null on the one row a window with nothing ranked comes back as, which is
    // the window itself and not a stock in it.
    if (
      row.symbol === null ||
      row.close === null ||
      row.change_percent === null
    ) {
      continue;
    }

    window.leaders.push({
      symbol: row.symbol,
      logoUrl: phStocksLogoUrl(row.symbol),
      close: row.close,
      changePercent: row.change_percent,
    });
  }

  /**
   * The window the query built for a period and a span.
   *
   * Every one of the eight is in the result — `periods` is crossed before
   * anything is joined to it, and the join that follows is `LEFT` — so a miss
   * here means the query and these unions have stopped agreeing, which is worth
   * failing over rather than rendering around.
   */
  function windowFor(period: PerformancePeriod, span: PeriodSpan): PeriodWindow {
    const window = windows.get(`${period}/${span}`);

    if (!window) {
      throw new Error(`No ${span} ${period} window in the leaders result.`);
    }

    return window;
  }

  // Written out rather than built from `PERIOD_KEYS` and `PERIOD_SPANS` so the
  // record stays exhaustively typed: a window added to `PerformancePeriod` — or
  // a turn added to `PeriodSpan` — is a type error here until it is given an
  // entry of its own.
  const periods: Record<PerformancePeriod, Record<PeriodSpan, PeriodWindow>> = {
    ytd: {
      current: windowFor('ytd', 'current'),
      previous: windowFor('ytd', 'previous'),
    },
    qtd: {
      current: windowFor('qtd', 'current'),
      previous: windowFor('qtd', 'previous'),
    },
    mtd: {
      current: windowFor('mtd', 'current'),
      previous: windowFor('mtd', 'previous'),
    },
    wtd: {
      current: windowFor('wtd', 'current'),
      previous: windowFor('wtd', 'previous'),
    },
  };

  return { asOf, fallbackLogoUrl, periods };
}
