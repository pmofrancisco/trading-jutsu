import type { Mover, MoverFormat } from '@/components/movers-table';
import MoversTable, { MoversTableSkeleton } from '@/components/movers-table';
import { Tabs } from '@heroui/react';

/**
 * The two tabs themselves, without the panels under them.
 *
 * Shared by both states below rather than written twice: the tabs name the two
 * directions, which is knowable before a single row is, so the loading state
 * shows the real pill and not a placeholder for one.
 */
function MoversTabList() {
  return (
    /* `self-start` so the pill is only as wide as the two tabs; the tab list
     * would otherwise stretch across the page, which the column layout of
     * `Tabs` makes it do by default. */
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
          Gainers
        </Tabs.Tab>
        <Tabs.Tab className="whitespace-nowrap" id="losers">
          <Tabs.Indicator />
          Losers
        </Tabs.Tab>
      </Tabs.List>
    </Tabs.ListContainer>
  );
}

/**
 * The session's two lists, one at a time.
 *
 * Tabs rather than two tables down the page: they are the same four columns
 * ranked from opposite ends, and side by side each would be half as wide as its
 * figures need. `Tabs` keeps its own selection state internally, so this stays a
 * Server Component — the only props crossing the boundary are strings.
 *
 * The labels carry no count. Both markets cap their lists, so a count would only
 * ever read back the cap and would say how long the list is rather than anything
 * about the session. Each page says what its cap is once, above.
 *
 * Shared rather than one copy per market: what differs between the two pages is
 * the locale the figures are written in, and that arrives as `format` — see
 * `MoverFormat`.
 */
export default function DailyMoversTabs({
  fallbackLogoUrl,
  format,
  gainers,
  losers,
}: {
  /** The market's stand-in mark, passed straight through to both tables. */
  fallbackLogoUrl: string;
  format: MoverFormat;
  gainers: Mover[];
  losers: Mover[];
}) {
  return (
    <Tabs>
      <MoversTabList />
      <Tabs.Panel id="gainers">
        <MoversTable
          emptyMessage="No stock closed higher in this session."
          fallbackLogoUrl={fallbackLogoUrl}
          format={format}
          label="Gainers"
          movers={gainers}
        />
      </Tabs.Panel>
      <Tabs.Panel id="losers">
        <MoversTable
          emptyMessage="No stock closed lower in this session."
          fallbackLogoUrl={fallbackLogoUrl}
          format={format}
          label="Losers"
          movers={losers}
        />
      </Tabs.Panel>
    </Tabs>
  );
}

/**
 * The same two tabs with both lists still in flight.
 *
 * Both panels are filled rather than only the selected one: the tabs stay live
 * while the rows load — `Tabs` selects between them on the client and needs no
 * data to do it — so someone who reaches for Losers before the query answers
 * finds a loading table there rather than an empty panel.
 */
export function DailyMoversTabsSkeleton() {
  return (
    <Tabs>
      <MoversTabList />
      <Tabs.Panel id="gainers">
        <MoversTableSkeleton label="Gainers" />
      </Tabs.Panel>
      <Tabs.Panel id="losers">
        <MoversTableSkeleton label="Losers" />
      </Tabs.Panel>
    </Tabs>
  );
}
