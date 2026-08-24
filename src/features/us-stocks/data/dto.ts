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
 * Both lists are capped at `MOVER_LIMIT`. The US market lists thousands of
 * symbols where the PSE lists hundreds, so unlike the PH page these are the
 * extremes of the session rather than every stock that moved.
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
