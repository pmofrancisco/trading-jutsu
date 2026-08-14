/**
 * The shapes the PH Stocks data layer is allowed to hand to the render context.
 */

/**
 * Year-to-date performance of one PSE index.
 *
 * Every field but `symbol` and `name` is nullable, because the row is built for
 * each index we ask about whether or not `market_data` has the bars to price it:
 * a newly tracked index has no bar from last year to measure against, and one
 * that is not in the table at all has no bars whatsoever. The render context
 * decides how to present that; the data layer will not invent a number.
 */
export interface IndexPerformance {
  symbol: string;
  name: string;
  /** Close of the most recent bar, and the day it is dated. */
  latestClose: number | null;
  asOf: Date | null;
  /** Close of the last bar before 1 January, the year's starting level. */
  baselineClose: number | null;
  baselineDate: Date | null;
  /** Percentage change from `baselineClose` to `latestClose`. */
  ytdPercent: number | null;
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
