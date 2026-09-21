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
  /**
   * The stock's logo, as an absolute URL. Built from the symbol rather than
   * stored, and handed over already built because a table should not have to
   * know where an image lives to display one. Not every symbol has a file
   * behind it — see `fallbackLogoUrl`.
   */
  logoUrl: string;
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
 * The windows a stock's move is measured over, longest first — the order the
 * tabs are in.
 *
 * A union rather than a loose field per window, because it is what keys the
 * record on `PeriodLeaders`: adding a period here is a type error everywhere
 * that builds or reads one, so a new window cannot be half-added.
 */
export type PerformancePeriod = 'ytd' | 'qtd' | 'mtd' | 'wtd';

/**
 * Which turn of a period is being measured — the one in progress, or the one
 * before it.
 *
 * A second dimension on the windows above rather than four more periods,
 * because it is the same four windows asked of a different turn: `qtd` and
 * `previous` is the quarter before this one, measured end to end. The current
 * span runs to the latest bar and is still moving; a previous span is a
 * finished period, opening where its own turn began and closing where the
 * current one starts.
 *
 * `current` first, for the reason the periods are ordered as they are: it is
 * the default, and the one a reader arrives wanting.
 */
export type PeriodSpan = 'current' | 'previous';

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
  /**
   * The stock's logo, as an absolute URL. Built from the symbol rather than
   * stored, and handed over already built because a table should not have to
   * know where an image lives to display one. Not every symbol has a file
   * behind it — see `fallbackLogoUrl`.
   */
  logoUrl: string;
  /** Close of the latest session. */
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
 * One window — a period and a span — and what it ranks.
 *
 * The window is described as well as filled, because a ranking alone cannot say
 * which turn of the period it is: two `qtd` tables are the same four columns,
 * and only the dates tell the quarter that is running from the one before it.
 */
export interface PeriodWindow {
  /**
   * When the window opens. The level its figures are measured from is the last
   * close before this, not a close at it.
   */
  start: Date;
  /**
   * The calendar year and month (1-12) the window opens in, counted in the zone
   * this market's bars are truncated in — `America/New_York`, not the server's.
   *
   * Carried as numbers beside `start` rather than derived from it in the UI:
   * the zone is a fact of the data layer — see the note on `PERIOD_TRUNC_UNITS`
   * — and it matters most here, where a bar is dated at the closing bell. A
   * render context that recomputed the calendar in UTC would file an evening
   * close under the following day and could name a window a day out.
   */
  year: number;
  month: number;
  /**
   * Whether the table holds any bar the window could open from — that is,
   * whether there is a close in the week before `start`.
   *
   * Needed because an empty ranking has two quite different causes, and a page
   * that could not tell them apart would blame the board for both. This
   * database keeps a rolling window of recent sessions rather than the whole
   * history, so a period far enough back has nothing to measure from at all:
   * that is not a board on which nothing gained, and saying so would be wrong.
   */
  measurable: boolean;
  /** Biggest gain first; empty when nothing gained, or nothing could be. */
  leaders: PeriodLeader[];
}

/**
 * The strongest performers over each window, biggest gain first.
 *
 * Keyed by period and then by span rather than held as one list with both on
 * every row, because that is how the page reads it — one tab and one toggle,
 * one ranking — and because a record keyed on the unions cannot be built with a
 * window missing.
 *
 * Two shapes rather than one with nullable fields, because the two cases are
 * not the same question. With bars in the table there is always a session to
 * name and always eight windows to describe, however few of them anything
 * gained over; with none there is neither, and a window with no date is not a
 * window. Discriminating on `asOf` means the page's existing check for an empty
 * board is also what narrows `periods` to something it can render, so neither
 * can be read without the other having been asked about.
 */
export interface RankedPeriodLeaders {
  /**
   * The latest session on the board.
   *
   * It dates the current spans, which run up to it; a previous span closes
   * where the current one opens and is dated by its own window instead. Unlike
   * the figure this replaced it is the session the data reaches, not the one a
   * ranking reached: a board on which nothing gained still has a latest
   * session, and the page no longer mistakes the one for the other.
   */
  asOf: Date;
  /**
   * The stand-in logo for a symbol the bucket has no file for, which most of
   * the board still is. Carried once here rather than on every row, because it
   * is one value per market and a hundred rows repeating it would be the same
   * string a hundred times over the wire.
   */
  fallbackLogoUrl: string;
  periods: Record<PerformancePeriod, Record<PeriodSpan, PeriodWindow>>;
}

/**
 * A board with no bars at all, which has neither a session nor a window to
 * name.
 */
export interface EmptyPeriodLeaders {
  asOf: null;
  fallbackLogoUrl: string;
  periods: null;
}

export type PeriodLeaders = RankedPeriodLeaders | EmptyPeriodLeaders;
