import type { IndexPerformance } from '@/features/ph-stocks/data/dto';
import IndexPerformanceCard from '@/features/ph-stocks/ui/index-performance-card';
import PeriodTabs from '@/features/ph-stocks/ui/period-tabs';

/**
 * The indices measured over each period, one period at a time.
 *
 * Tabs rather than a grid per period down the page: they are the same seven
 * cards measured from a different starting level, and stacking them would put
 * the month two full screens below the year with no way to compare them.
 *
 * The same grid sits under every tab, so the cards do not shift on a switch.
 */
export default function IndexPerformanceTabs({
  performances,
}: {
  performances: IndexPerformance[];
}) {
  return (
    <PeriodTabs label="Performance period">
      {(period) => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {performances.map((performance) => (
            <IndexPerformanceCard
              key={performance.symbol}
              performance={performance}
              period={period}
            />
          ))}
        </div>
      )}
    </PeriodTabs>
  );
}
