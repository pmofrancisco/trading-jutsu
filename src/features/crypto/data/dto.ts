/**
 * The shapes the Crypto data layer is allowed to hand to the render context.
 */

/**
 * One coin's move over the latest daily bar.
 *
 * Nothing here is nullable: a symbol earns a row only by having a bar in the
 * latest day *and* an earlier bar to measure it against, so a mover that cannot
 * be priced is left out of the list rather than rendered as a blank.
 */
export interface DailyMover {
  symbol: string;
  /**
   * The coin's logo, as an absolute URL. Built from the symbol rather than
   * stored, and handed over already built because a table should not have to
   * know where an image lives to display one. Not every symbol has a file
   * behind it — see `fallbackLogoUrl`.
   */
  logoUrl: string;
  /** Close of the latest daily bar. */
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
 * The latest day's movers, split by direction and ranked by the size of the
 * move. Coins that closed unchanged appear in neither list — they moved in no
 * direction, so there is no list they belong at either end of.
 *
 * Both lists are capped at `MOVER_LIMIT`: these are the ends of the board for
 * the day, not every coin that moved over it.
 */
export interface DailyMovers {
  /**
   * The day both lists describe, or `null` when `market_data` holds no bars at
   * all and there is no day to name.
   */
  asOf: Date | null;
  /**
   * The stand-in logo for a symbol the bucket has no file for, which most of
   * the board still is. Carried once here rather than on every row, because it
   * is one value per market and a hundred rows repeating it would be the same
   * string a hundred times over the wire.
   */
  fallbackLogoUrl: string;
  /** Biggest gain first. */
  gainers: DailyMover[];
  /** Biggest loss first. */
  losers: DailyMover[];
}

/**
 * The windows a move is measured over, longest first — the order the tabs are
 * in.
 *
 * A union rather than a loose field per window, because it is what keys the
 * record below: adding a period here is a type error everywhere that builds or
 * reads one, so a new window cannot be half-added.
 */
export type PerformancePeriod = 'ytd' | 'qtd' | 'mtd' | 'wtd';

/**
 * One coin's standing in a period's ranking.
 *
 * Nothing here is nullable, for the same reason nothing on `DailyMover` is: a
 * symbol earns a row only by having a bar in the latest day *and* a bar before
 * the period began to measure it against, so a coin that cannot be priced over
 * the window is left out of the ranking rather than ranked as a blank. There is
 * no rank field either — the array position is the rank, and a number carried
 * alongside the order could only ever disagree with it.
 */
export interface PeriodLeader {
  symbol: string;
  /**
   * The coin's logo, as an absolute URL. Built from the symbol rather than
   * stored, for the reason `DailyMover.logoUrl` is: a table should not have to
   * know where an image lives to display one. Not every symbol has a file
   * behind it — see `fallbackLogoUrl`.
   */
  logoUrl: string;
  /** Close of the latest daily bar. */
  close: number;
  /**
   * The move from the last close before the period began, as a percentage of
   * it. That baseline is not here: it is what the figure is measured from, not
   * something the table shows.
   *
   * Always positive: a ranking holds only what gained over the window — see
   * `listPeriodLeaders`. The type cannot say so, which is why the table it
   * feeds still colours the figure by its sign rather than assuming one.
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
   * The day every ranking ends at, or `null` when no coin in the latest day
   * gained over any window — whether because none can be priced over one or
   * because the board fell across all four — and there is none to name.
   */
  asOf: Date | null;
  /**
   * The stand-in logo for a symbol the bucket has no file for, which most of
   * the board still is. Carried once here rather than on every row, because it
   * is one value per market and a hundred rows repeating it would be the same
   * string a hundred times over the wire.
   */
  fallbackLogoUrl: string;
  periods: Record<PerformancePeriod, PeriodLeader[]>;
}
