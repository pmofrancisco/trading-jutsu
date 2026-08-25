import { DailyMoversTabsSkeleton } from '@/components/daily-movers-tabs';
import { Skeleton, Typography } from '@heroui/react';

/**
 * A gainers-and-losers page with its session still being read.
 *
 * Shaped like the page it stands in for — same heading, same summary line, same
 * tabs — so the two differ only where they have to. What the page already knows
 * without asking the database is rendered for real: the heading is fixed text,
 * and so are the two tabs. Only the summary and the rows, which are the
 * session's to say, come through as placeholders.
 *
 * Shared by both markets' routes rather than written per market, because
 * nothing a skeleton shows is market-specific: the locale only matters once
 * there are figures to write in it.
 */
export default function DailyMoversLoading() {
  return (
    // `aria-busy` so a screen reader is told the region is still filling in,
    // rather than reading out a table of eight empty rows as the page's answer.
    <div aria-busy="true" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography.Heading className="text-2xl" level={1} weight="bold">
          Gainers and losers
        </Typography.Heading>
        {/* One bar, sized to the sentence it stands in for: `h-5` is the line
         * box of the `text-sm` paragraph the page renders here, and the summary
         * fits on one line at any width wide enough not to wrap it. `w-full`
         * under that cap so the bar wraps the way the sentence would. */}
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <DailyMoversTabsSkeleton />
    </div>
  );
}
