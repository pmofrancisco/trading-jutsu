import {
  LEADERS_LIMIT,
  listPeriodLeaders,
} from '@/features/ph-stocks/data/period-leaders';
import PeriodLeadersTabs from '@/features/ph-stocks/ui/period-leaders-tabs';
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
         * the tabs' and the toggle's to say, and a heading reading
         * "Year-to-date" above a selected QTD tab would contradict the figures
         * under it.
         */}
        <Typography.Heading className="text-2xl" level={1} weight="bold">
          Leaders
        </Typography.Heading>
        {/* The sentence names what every ranking on the page is, and leaves
         * *which* window to the controls below it: with eight of them, four
         * still running and four finished, there is no one date the page can
         * put here that stays true as they are switched between. Each window
         * writes its own days out above its table instead. */}
        <p className="text-muted text-sm">
          {asOf === null
            ? 'No leaders to show yet.'
            : `The ${LEADERS_LIMIT} biggest gains over each period.`}
        </p>
      </div>
      {/* `asOf` is `null` only when the table holds no bars at all — see the
       * DTO — and narrowing on it is what makes `periods` renderable here. */}
      {asOf !== null && (
        <PeriodLeadersTabs
          asOf={asOf}
          fallbackLogoUrl={fallbackLogoUrl}
          periods={periods}
        />
      )}
    </div>
  );
}
