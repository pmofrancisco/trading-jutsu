import { Tabs } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * The windows a move is measured over, longest first — the order the tabs are
 * in.
 *
 * Declared here rather than imported from a feature, because a shared component
 * may not reach into one — see the layering rules in `AGENTS.md`. Each market's
 * `PerformancePeriod` is the same union, so a feature still hands over its own
 * type and nothing is cast.
 */
export type Period = 'ytd' | 'qtd' | 'mtd' | 'wtd';

/**
 * How each window is labelled on its tab. The abbreviations are enough above a
 * column of figures; the pages spell them out where they have to explain
 * themselves — see `PERIOD_NAMES` in `index-performance-card`.
 */
export const PERIOD_LABELS: Record<Period, string> = {
  ytd: 'YTD',
  qtd: 'QTD',
  mtd: 'MTD',
  wtd: 'WTD',
};

/** The tabs in display order, longest window first — see `Period`. */
const PERIODS = Object.keys(PERIOD_LABELS) as Period[];

/**
 * The same four windows, whatever is being measured over them.
 *
 * Three pages ask this question — the PSE indices priced over each period, and
 * each market's stocks ranked over them — and before this the strip was written
 * out per page, four tabs and four panels apiece, so a fifth window would have
 * been a change in three places instead of one. Shared rather than owned by one
 * market for the reason `movers-table` is: the markup is the same everywhere,
 * and what differs — the figures, and the locale they are written in — arrives
 * from the panel each caller renders.
 *
 * `children` is a function, and is called here rather than passed on: this is a
 * Server Component, so the elements it returns are already rendered by the time
 * `Tabs` receives them and nothing but markup crosses the boundary. It is a
 * function so that a panel cannot be built for the wrong window — the period a
 * caller renders is the period it was handed, not one it names again.
 *
 * Every panel is rendered on the server, so switching tabs costs no fetch, and
 * `Tabs` keeps its selection state internally — which is what leaves every
 * caller a Server Component. The first tab is the one it opens on: the year is
 * the figure these pages lead with, and the shorter windows are read against
 * it.
 */
export default function PeriodTabs({
  label,
  children,
}: {
  /** Names the tab list for a screen reader, which the tabs alone do not. */
  label: string;
  children: (period: Period) => ReactNode;
}) {
  return (
    <Tabs>
      {/* `self-start` so the pill is only as wide as the tabs; the tab list
       * would otherwise stretch across the page, which the column layout of
       * `Tabs` makes it do by default. */}
      <Tabs.ListContainer className="self-start">
        <Tabs.List aria-label={label}>
          {PERIODS.map((period) => (
            <Tabs.Tab id={period} key={period}>
              {/*
               * The indicator is the moving pill behind the selected tab, and
               * it lives inside each tab: React Aria hands it its selected
               * state through context and animates it between them.
               */}
              <Tabs.Indicator />
              {PERIOD_LABELS[period]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {PERIODS.map((period) => (
        <Tabs.Panel id={period} key={period}>
          {children(period)}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
