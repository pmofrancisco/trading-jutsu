import { listIndexPerformance } from '@/features/ph-stocks/data/index-performance';
import IndexPerformanceTabs from '@/features/ph-stocks/ui/index-performance-tabs';
import { Typography } from '@heroui/react';

export default async function IndicesPerformance() {
  const performances = await listIndexPerformance();

  return (
    <div className="flex flex-col gap-4">
      {/*
       * `Typography.Heading` rather than a bare `<h1>` so the page title picks
       * up the same scale as the rest of the app. `level` is a number, so it
       * survives the server/client boundary — see the note in `sign-in/page`.
       *
       * It names the page rather than the period it opens on: the period is the
       * tabs' to say, and a heading reading "Year-to-date" above a selected QTD
       * tab would contradict the figures under it.
       */}
      <Typography.Heading className="text-2xl" level={1} weight="bold">
        Indices performance
      </Typography.Heading>
      <IndexPerformanceTabs performances={performances} />
    </div>
  );
}
