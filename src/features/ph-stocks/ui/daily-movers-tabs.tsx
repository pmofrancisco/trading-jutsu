import type { DailyMovers } from '@/features/ph-stocks/data/dto';
import MoversTable from '@/features/ph-stocks/ui/movers-table';
import { Tabs } from '@heroui/react';

/**
 * The session's two lists, one at a time.
 *
 * Tabs rather than two tables down the page: they are the same five columns
 * ranked from opposite ends, and side by side each would be half as wide as its
 * figures need. `Tabs` keeps its own selection state internally, so this stays a
 * Server Component — the only props crossing the boundary are strings.
 */
export default function DailyMoversTabs({
  gainers,
  losers,
}: Pick<DailyMovers, 'gainers' | 'losers'>) {
  return (
    <Tabs>
      {/* `self-start` so the pill is only as wide as the two tabs; the tab list
       * would otherwise stretch across the page, which the column layout of
       * `Tabs` makes it do by default. */}
      <Tabs.ListContainer className="self-start">
        <Tabs.List aria-label="Gainers and losers">
          {/*
           * The indicator is the moving pill behind the selected tab, and it
           * lives inside each tab: React Aria hands it its selected state
           * through context and animates it between the two.
           *
           * `whitespace-nowrap` because the tabs divide the list's width
           * evenly: without it the longer label wraps onto a second line
           * inside a tab that is a fixed 32px tall.
           */}
          <Tabs.Tab className="whitespace-nowrap" id="gainers">
            <Tabs.Indicator />
            Gainers ({gainers.length})
          </Tabs.Tab>
          <Tabs.Tab className="whitespace-nowrap" id="losers">
            <Tabs.Indicator />
            Losers ({losers.length})
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="gainers">
        <MoversTable
          emptyMessage="No stock closed higher in this session."
          label="Gainers"
          movers={gainers}
        />
      </Tabs.Panel>
      <Tabs.Panel id="losers">
        <MoversTable
          emptyMessage="No stock closed lower in this session."
          label="Losers"
          movers={losers}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
