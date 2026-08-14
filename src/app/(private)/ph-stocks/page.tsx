import { listDailyMovers } from '@/features/ph-stocks/data/daily-movers';
import DailyMoversTabs from '@/features/ph-stocks/ui/daily-movers-tabs';
import { formatDate } from '@/features/ph-stocks/ui/format';
import { Typography } from '@heroui/react';

export default async function PhStocks() {
  const { asOf, gainers, losers } = await listDailyMovers();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {/*
         * `Typography.Heading` rather than a bare `<h1>` so the page title picks
         * up the same scale as the rest of the app. `level` is a number, so it
         * survives the server/client boundary — see the note in `sign-in/page`.
         */}
        <Typography.Heading className="text-2xl" level={1} weight="bold">
          Gainers and losers
        </Typography.Heading>
        {/* The session is named once here rather than repeated per row: every
         * figure in both tables is measured over the same one. */}
        <p className="text-muted text-sm">
          {/* Not "no market data": `asOf` is also null when the table holds
           * bars but none of them can be priced against an earlier one, and a
           * message that blamed the data would send someone to the wrong
           * place. */}
          {asOf
            ? `Trading on ${formatDate(asOf)}, against each stock's previous close.`
            : 'No movers to show yet.'}
        </p>
      </div>
      <DailyMoversTabs gainers={gainers} losers={losers} />
    </div>
  );
}
