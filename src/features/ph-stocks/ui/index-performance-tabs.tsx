import type {
  IndexPerformance,
  PerformancePeriod,
} from '@/features/ph-stocks/data/dto';
import IndexPerformanceCard from '@/features/ph-stocks/ui/index-performance-card';
import { Tabs } from '@heroui/react';

/** The same grid under either tab, so the cards do not shift on a switch. */
function PeriodGrid({
  performances,
  period,
}: {
  performances: IndexPerformance[];
  period: PerformancePeriod;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {performances.map((performance) => (
        <IndexPerformanceCard
          key={performance.symbol}
          performance={performance}
          period={period}
        />
      ))}
    </div>
  );
}

/**
 * The indices measured over each period, one period at a time.
 *
 * Tabs rather than two grids down the page: they are the same seven cards
 * measured from a different starting level, and stacking them would put the
 * quarter a full screen below the year with no way to compare the two. Both
 * panels are rendered on the server, so switching costs no fetch — `Tabs` keeps
 * its own selection state internally, which leaves this a Server Component with
 * only strings and numbers crossing the boundary.
 */
export default function IndexPerformanceTabs({
  performances,
}: {
  performances: IndexPerformance[];
}) {
  return (
    <Tabs>
      {/* `self-start` so the pill is only as wide as the two tabs; the tab list
       * would otherwise stretch across the page, which the column layout of
       * `Tabs` makes it do by default. */}
      <Tabs.ListContainer className="self-start">
        <Tabs.List aria-label="Performance period">
          {/*
           * The indicator is the moving pill behind the selected tab, and it
           * lives inside each tab: React Aria hands it its selected state
           * through context and animates it between the two.
           */}
          <Tabs.Tab id="ytd">
            <Tabs.Indicator />
            YTD
          </Tabs.Tab>
          <Tabs.Tab id="qtd">
            <Tabs.Indicator />
            QTD
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="ytd">
        <PeriodGrid performances={performances} period="ytd" />
      </Tabs.Panel>
      <Tabs.Panel id="qtd">
        <PeriodGrid performances={performances} period="qtd" />
      </Tabs.Panel>
    </Tabs>
  );
}
