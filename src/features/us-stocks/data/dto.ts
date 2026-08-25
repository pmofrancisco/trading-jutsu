/**
 * The shapes the US Stocks data layer is allowed to hand to the render context.
 */

/**
 * One stock's move over the latest trading session.
 *
 * Nothing here is nullable: a symbol earns a row only by having a bar in the
 * latest session *and* an earlier bar to measure it against, so a mover that
 * cannot be priced is left out of the list rather than rendered as a blank.
 */
export interface DailyMover {
  symbol: string;
  /** Close of the latest session. */
  close: number;
  /**
   * The move from the symbol's own previous close — in dollars, and as a
   * percentage of it. The previous close itself is not here: it is what the
   * figures are measured from, not something the tables show.
   */
  change: number;
  changePercent: number;
}

/**
 * The latest session's movers, split by direction and ranked by the size of the
 * move. Stocks that closed unchanged appear in neither list — they moved in no
 * direction, so there is no list they belong at either end of.
 *
 * Both lists are capped at `MOVER_LIMIT`: these are the ends of the board for
 * the session, not every stock that moved over it.
 */
export interface DailyMovers {
  /**
   * The session both lists describe, or `null` when `market_data` holds no
   * bars at all and there is no session to name.
   */
  asOf: Date | null;
  /** Biggest gain first. */
  gainers: DailyMover[];
  /** Biggest loss first. */
  losers: DailyMover[];
}

/**
 * The windows a stock's move is measured over, longest first — the order the
 * tabs are in.
 *
 * A union rather than a loose field per window, because it is what keys the
 * record on `PeriodLeaders`: adding a period here is a type error everywhere
 * that builds or reads one, so a new window cannot be half-added.
 */
export type PerformancePeriod = 'ytd' | 'qtd' | 'mtd' | 'wtd';

/**
 * One stock's standing in a period's ranking.
 *
 * Nothing here is nullable, for the same reason nothing on `DailyMover` is: a
 * symbol earns a row only by having a bar in the latest session *and* a bar
 * just before the period began to measure it against, so a stock that cannot be
 * priced over the window is left out of the ranking rather than ranked as a
 * blank. There is no rank field either — the array position is the rank, and a
 * number carried alongside the order could only ever disagree with it.
 */
export interface PeriodLeader {
  symbol: string;
  /** Close of the latest session. */
  close: number;
  /**
   * The move from the last close before the period began, as a percentage of
   * it. That baseline is not here: it is what the figure is measured from, not
   * something the table shows.
   */
  changePercent: number;
}

/**
 * The strongest performers over each window, biggest gain first.
 *
 * Keyed by period rather than held as one list with a period on every row,
 * because that is how the page reads it — one tab, one ranking — and because a
 * record keyed on the union cannot be built with a window missing.
 */
export interface PeriodLeaders {
  /**
   * The session every ranking ends at, or `null` when no stock in the latest
   * session can be priced over any window and there is none to name.
   */
  asOf: Date | null;
  periods: Record<PerformancePeriod, PeriodLeader[]>;
}
