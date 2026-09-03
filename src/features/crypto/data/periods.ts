import 'server-only';

import type { PerformancePeriod } from './dto';

/**
 * Where each window starts, as the unit `date_trunc` truncates the newest bar
 * to. This is the whole definition of a period: the query takes the units from
 * here rather than naming any one of them, so another window is this record and
 * the union behind it, not another block of SQL.
 *
 * Postgres truncates a week to the Monday, so the week-to-date cut-off is the
 * Monday of the newest bar's week and the level it measures from is the Sunday
 * before it. Unlike the stock markets there is no weekend to skip: crypto has a
 * bar for every day, so a week-to-date figure opens on the week's own first
 * close rather than on the previous Friday's.
 *
 * This market's own copy rather than a shared one, for the reason `format` is:
 * features do not import each other, and the three data layers read separate
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
