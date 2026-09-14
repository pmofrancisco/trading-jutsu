import 'server-only';

import type { PerformancePeriod } from './dto';

/**
 * Where each window starts, as the unit `date_trunc` truncates the newest bar
 * to. This is the whole definition of a period: the query takes the units from
 * here rather than naming any one of them, so another window is this record and
 * the union behind it, not another block of SQL.
 *
 * Postgres truncates a week to the Monday, so the week-to-date cut-off is the
 * Monday of the newest bar's week and the level it measures from is the bar
 * before it. On this board that is Sunday's: the spot week opens on Sunday
 * evening and the loader writes a bar for it, so a week-to-date figure is
 * measured from the Sunday close rather than from the previous Friday's the way
 * the stock markets' is. Saturday is the one day of the week with no bar at all.
 *
 * This market's own copy rather than a shared one, for the reason `format` is:
 * features do not import each other, and the four data layers read separate
 * databases whose bars are stamped in different time zones. The record is the
 * same today because the four windows are the same four windows; the query that
 * consumes it is not.
 */
const PERIOD_TRUNC_UNITS: Record<PerformancePeriod, string> = {
  ytd: 'year',
  qtd: 'quarter',
  mtd: 'month',
  wtd: 'week',
};

/**
 * The periods and their units as the parallel `text[]` parameters the query
 * `unnest`s into a row apiece — index-aligned, because they are built from one
 * traversal of the record above.
 *
 * The key order is the display order, longest window first: it is the order the
 * tabs are in, and `PerformancePeriod` says so where it is declared.
 */
export const PERIOD_KEYS = Object.keys(
  PERIOD_TRUNC_UNITS,
) as PerformancePeriod[];

export const PERIOD_UNITS = PERIOD_KEYS.map(
  (period) => PERIOD_TRUNC_UNITS[period],
);
