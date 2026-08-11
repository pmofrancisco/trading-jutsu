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
