/**
 * The shapes the PH Stocks data layer is allowed to hand to the render context.
 */

/**
 * The windows an index's move is measured over, longest first — the order the
 * tabs are in.
 *
 * A union rather than a loose field per window on `IndexPerformance`, because it
 * is what keys the record below: adding a period here is a type error everywhere
 * that builds or reads one, so a new window cannot be half-added.
 */
export type PerformancePeriod = 'ytd' | 'qtd' | 'mtd' | 'wtd';

/**
 * One index's move over one period.
 *
 * Every field is nullable, because the row is built for each index we ask about
 * whether or not `market_data` has the bars to price it: an index first tracked
 * partway through the year has no bar from before January to measure against.
 * The render context decides how to present that; the data layer will not invent
 * a number.
 */
export interface PeriodPerformance {
  /** Close of the last bar before the period began, its starting level. */
  baselineClose: number | null;
  baselineDate: Date | null;
  /** Percentage change from `baselineClose` to the index's latest close. */
  changePercent: number | null;
}

/**
 * Performance of one PSE index.
 *
 * The identity and the latest level sit here rather than inside `periods`
 * because they do not vary by period: there is one newest bar per index, and
 * what changes between the periods is only what that bar is measured from.
 * `latestClose` and `asOf` are nullable for an index that is not in the table at
 * all and so has no bars whatsoever.
 */
export interface IndexPerformance {
  symbol: string;
  name: string;
  /**
   * The index's logo, as an absolute URL. Built from the symbol rather than
   * stored, so it is here for the same reason `name` is: the card should not
   * have to know where an image lives to display one.
   */
  logoUrl: string;
  /** Close of the most recent bar, and the day it is dated. */
  latestClose: number | null;
  asOf: Date | null;
  /** The same latest close, measured from the start of each period. */
  periods: Record<PerformancePeriod, PeriodPerformance>;
}

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
   * The move from the symbol's own previous close — in pesos, and as a
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
 * One stock's standing in a period's ranking.
 *
 * Nothing here is nullable, for the same reason nothing on `DailyMover` is: a
 * symbol earns a row only by having a bar in the latest session *and* a bar
 * before the period began to measure it against, so a stock that cannot be
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
