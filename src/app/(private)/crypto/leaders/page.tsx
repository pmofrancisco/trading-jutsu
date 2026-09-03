import {
  LEADERS_LIMIT,
  listPeriodLeaders,
} from '@/features/crypto/data/period-leaders';
import { formatDate } from '@/features/crypto/ui/format';
import PeriodLeadersTabs from '@/features/crypto/ui/period-leaders-tabs';
import { Typography } from '@heroui/react';

export default async function Leaders() {
  const { asOf, fallbackLogoUrl, periods } = await listPeriodLeaders();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        {/*
         * `Typography.Heading` rather than a bare `<h1>` so the page title picks
         * up the same scale as the rest of the app. `level` is a number, so it
         * survives the server/client boundary — see the note in `sign-in/page`.
         *
         * It names the page rather than the window it opens on: the window is
         * the tabs' to say, and a heading reading "Year-to-date" above a
         * selected QTD tab would contradict the figures under it.
         */}
        <Typography.Heading className="text-2xl" level={1} weight="bold">
          Leaders
        </Typography.Heading>
        {/* The day is named once here rather than repeated per row: every
         * ranking on the page is measured to the same one. It is named as a
         * date and not as trading, the way the stock pages name it: crypto
         * never closes, so what these rankings end at is a UTC day. */}
        <p className="text-muted text-sm">
          {/* Not "no market data": `asOf` is also null when the table holds
           * bars but nothing gained over any window — unmeasurable, or simply
           * down — and a message that blamed the data would send someone to the
           * wrong place. */}
          {asOf
            ? `The ${LEADERS_LIMIT} biggest gains since the start of each period, up to ${formatDate(asOf)}.`
            : 'No leaders to show yet.'}
        </p>
      </div>
      <PeriodLeadersTabs fallbackLogoUrl={fallbackLogoUrl} periods={periods} />
    </div>
  );
}
