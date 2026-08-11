import { listIndexPerformance } from '@/features/ph-stocks/data/index-performance';
import IndexPerformanceCard from '@/features/ph-stocks/ui/index-performance-card';
import { Typography } from '@heroui/react';

export default async function PhStocks() {
  const performances = await listIndexPerformance();

  return (
    <div className="flex flex-col gap-4">
      {/*
       * `Typography.Heading` rather than a bare `<h1>` so the page title picks
       * up the same scale as the rest of the app. `level` is a number, so it
       * survives the server/client boundary — see the note in `sign-in/page`.
       */}
      <Typography.Heading className="text-2xl" level={1} weight="bold">
        Year-to-date performance
      </Typography.Heading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {performances.map((performance) => (
          <IndexPerformanceCard
            key={performance.symbol}
            performance={performance}
          />
        ))}
      </div>
    </div>
  );
}
