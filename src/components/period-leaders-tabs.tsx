import type { Leader, LeaderFormat } from '@/components/leaders-table';
import LeadersTable from '@/components/leaders-table';
import type { PeriodSpan } from '@/components/period-span-toggle';
import PeriodSpanToggle from '@/components/period-span-toggle';
import type { Period } from '@/components/period-tabs';
import PeriodTabs, { PERIOD_LABELS } from '@/components/period-tabs';

/**
 * One window's ranking and the dates that name it.
 *
 * Declared here rather than imported from a feature, because a shared component
 * may not reach into one — see the layering rules in `AGENTS.md`. Every market's
 * `PeriodWindow` DTO satisfies this structurally, so each feature still hands
 * over its own type and nothing is cast.
 */
export interface LeaderWindow {
  start: Date;
  /** The calendar the window opens in, counted in the market's own zone. */
  year: number;
  month: number;
  /** Whether anything could be measured over it — see the DTO. */
  measurable: boolean;
  leaders: Leader[];
}

/**
 * How a market writes its figures and its dates — `LeadersTable`'s needs, plus
 * the one this level has of its own.
 */
export interface PeriodLeadersFormat extends LeaderFormat {
  formatDate: (date: Date) => string;
}

/**
 * How a month is written on a toggle.
 *
 * Shared rather than taken from each market's `format`, unlike every other
 * decision about how a figure is written: all four markets format in English —
 * `en-US` and `en-PH` — and both spell these the same, so a formatter apiece
 * would be four copies of one answer. A market in another language would need
 * the name from its own `format` instead; the year and the quarter beside it
 * are digits in any locale and would not.
 */
const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Half a day, in milliseconds.
 *
 * What a previous turn's closing date is found by stepping back from the
 * current turn's opening instant — see `windowDates`. Half a day rather than a
 * whole one because a window opens at midnight in the market's zone and a
 * clock change would carry a full day's step across it: stepping back 24 hours
 * from the Monday after a spring-forward Sunday lands at 23:00 on the Saturday
 * and would name the wrong day. Noon is the furthest a step can land from
 * either midnight, so an hour either way leaves the date alone.
 */
const HALF_A_DAY_MS = 12 * 60 * 60 * 1000;

/**
 * What a window is called on its toggle: the period it is, rather than which
 * turn of it.
 *
 * `2026 | 2025` says what `Current | Previous` would leave a reader to work
 * out, and the quarter and month are the windows where working it out is
 * hardest — *previous* on a quarter tab is last quarter, not last year. The
 * week is the one window with no calendar name of its own, so it keeps the
 * relative wording and the dates below the toggle settle which week it is.
 */
function windowLabel(
  period: Period,
  span: PeriodSpan,
  window: LeaderWindow,
): string {
  switch (period) {
    case 'ytd':
      return String(window.year);
    case 'qtd':
      return `Q${Math.ceil(window.month / 3)} ${window.year}`;
    case 'mtd':
      return `${MONTH_ABBREVIATIONS[window.month - 1]} ${window.year}`;
    case 'wtd':
      return span === 'current' ? 'This week' : 'Last week';
  }
}

/**
 * The window written out as the days it runs between.
 *
 * A current turn runs to the latest day on the board, which is the one date the
 * whole page shares. A previous turn has no such date and needs none: it closes
 * exactly where the current turn opens, so stepping back from that instant
 * lands inside its final day — the day it is named by, whether or not the board
 * had a bar on it.
 */
function windowDates(
  span: PeriodSpan,
  window: LeaderWindow,
  currentStart: Date,
  asOf: Date,
  format: PeriodLeadersFormat,
): string {
  const end =
    span === 'current'
      ? asOf
      : new Date(currentStart.getTime() - HALF_A_DAY_MS);

  return `${format.formatDate(window.start)} to ${format.formatDate(end)}`;
}

/**
 * The eight rankings, one at a time.
 *
 * Tabs for the period and a toggle for the turn, rather than eight tables down
 * the page: they are the same columns ranked over a different window, and
 * stacked they would be eight screens of near-identical tables with no way to
 * compare the top of one against the top of another. The two controls are not
 * the same question — one picks how long a window is, the other which turn of
 * it — so they are not one strip of eight tabs either.
 *
 * Every panel is rendered here, on the server, and the toggle picks between the
 * two it is given: switching costs no fetch, which is the whole reason the data
 * layer builds all eight windows in one query.
 *
 * Shared rather than one copy per market: what differs between the pages is the
 * locale the figures are written in, which arrives as `format` — see
 * `PeriodLeadersFormat` — and what an empty ranking is called, which arrives as
 * the message below.
 */
export default function PeriodLeadersTabs({
  asOf,
  emptyMessage = 'No stock gained over this period.',
  fallbackLogoUrl,
  format,
  periods,
}: {
  /** The latest day on the board, which dates every current turn. */
  asOf: Date;
  /**
   * What a ranking emptied by the market is called.
   *
   * Optional, defaulting to the stock markets' wording, because that is what
   * two of the four callers want and a market that shares the phrasing should
   * not have to restate it. Crypto and forex pass their own: neither has
   * stocks.
   *
   * It describes a board on which nothing rose, and only that. The other reason
   * a ranking can be empty — a window too far back for the table to reach — is
   * not about the board at all and is answered below, in wording no market
   * needs to vary.
   */
  emptyMessage?: string;
  /** The market's stand-in mark, passed straight through to each ranking. */
  fallbackLogoUrl: string;
  format: PeriodLeadersFormat;
  periods: Record<Period, Record<PeriodSpan, LeaderWindow>>;
}) {
  return (
    <PeriodTabs label="Leaders period">
      {(period) => {
        const windows = periods[period];

        function panel(span: PeriodSpan) {
          const window = windows[span];
          const label = windowLabel(period, span, window);

          return (
            <div className="flex flex-col gap-2">
              {/* The window written out, under the toggle that named it. It is
               * what tells `This week` from `Last week`, and what stops a
               * reader having to trust that `Q2 2026` means what they think. */}
              <p className="text-muted text-sm">
                {windowDates(
                  span,
                  window,
                  windows.current.start,
                  asOf,
                  format,
                )}
              </p>
              <LeadersTable
                emptyMessage={
                  window.measurable
                    ? emptyMessage
                    : 'Not enough history to rank this period.'
                }
                fallbackLogoUrl={fallbackLogoUrl}
                format={format}
                /* The label the table carries is the window it ranks, so a
                 * screen reader landing in the table knows which of the eight
                 * it is in. It is the same name the toggle above it shows, so
                 * the two can only ever say the same thing. */
                label={`${label} leaders`}
                leaders={window.leaders}
              />
            </div>
          );
        }

        return (
          <PeriodSpanToggle
            label={`${PERIOD_LABELS[period]} period`}
            labels={{
              current: windowLabel(period, 'current', windows.current),
              previous: windowLabel(period, 'previous', windows.previous),
            }}
            panels={{ current: panel('current'), previous: panel('previous') }}
          />
        );
      }}
    </PeriodTabs>
  );
}
