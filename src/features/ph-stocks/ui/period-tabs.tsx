import type { PerformancePeriod } from '@/features/ph-stocks/data/dto';
import { Tabs } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * How each window is labelled on its tab. The abbreviations are enough above a
 * column of figures; the pages spell them out where they have to explain
 * themselves — see `PERIOD_NAMES` in `index-performance-card`.
 */
export const PERIOD_LABELS: Record<PerformancePeriod, string> = {
  ytd: 'YTD',
  qtd: 'QTD',
  mtd: 'MTD',
  wtd: 'WTD',
};

/** The tabs in display order, longest window first — see `PerformancePeriod`. */
const PERIODS = Object.keys(PERIOD_LABELS) as PerformancePeriod[];

/**
 * The same four windows, whatever is being measured over them.
 *
 * Two pages ask this question — the indices priced over each period, the stocks
 * ranked over each — and before this they wrote the strip out twice, four tabs
 * and four panels apiece, so a fifth window would have been a change in three
 * places instead of one.
 *
 * `children` is a function, and is called here rather than passed on: this is a
 * Server Component, so the elements it returns are already rendered by the time
 * `Tabs` receives them and nothing but markup crosses the boundary. It is a
 * function so that a panel cannot be built for the wrong window — the period a
 * caller renders is the period it was handed, not one it names again.
 *
 * Every panel is rendered on the server, so switching tabs costs no fetch, and
 * `Tabs` keeps its selection state internally — which is what leaves both
 * callers Server Components. The first tab is the one it opens on: the year is
 * the figure these pages lead with, and the shorter windows are read against
 * it.
 */
export default function PeriodTabs({
  label,
  children,
}: {
  /** Names the tab list for a screen reader, which the tabs alone do not. */
  label: string;
  children: (period: PerformancePeriod) => ReactNode;
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
