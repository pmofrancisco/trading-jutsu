import type { IndexPerformance } from '@/features/ph-stocks/data/dto';
import { Card } from '@heroui/react';

const levelFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `exceptZero` so a gain carries a `+` and a flat year stays bare. */
const percentFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

/**
 * `timeZone: 'UTC'` because every bar is dated at midnight UTC — formatted in
 * any zone behind it, 11 Aug would render as 10 Aug.
 */
const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

/**
 * The `-soft-foreground` tokens rather than plain `text-success` / `text-danger`:
 * HeroUI mixes those toward the foreground, so the figure keeps its contrast in
 * both themes. A flat year is deliberately uncoloured — neither result.
 */
function toneClassName(ytdPercent: number): string {
  if (ytdPercent > 0) {
    return 'text-success-soft-foreground';
  }

  if (ytdPercent < 0) {
    return 'text-danger-soft-foreground';
  }

  return 'text-foreground';
}

export default function IndexPerformanceCard({
  performance,
}: {
  performance: IndexPerformance;
}) {
  const {
    symbol,
    name,
    latestClose,
    asOf,
    baselineClose,
    baselineDate,
    ytdPercent,
  } = performance;

  return (
    <Card>
      <Card.Header>
        <Card.Title>{symbol}</Card.Title>
        <Card.Description>{name}</Card.Description>
      </Card.Header>
      <Card.Content className="gap-1">
        <p
          className={`text-3xl font-bold tabular-nums ${
            ytdPercent === null ? 'text-muted' : toneClassName(ytdPercent)
          }`}
        >
          {ytdPercent === null
            ? '—'
            : `${percentFormatter.format(ytdPercent)}%`}
        </p>
        {latestClose !== null && (
          <p className="tabular-nums">
            {levelFormatter.format(latestClose)}
            {asOf && (
              <span className="text-muted text-sm">
                {' '}
                as of {dateFormatter.format(asOf)}
              </span>
            )}
          </p>
        )}
      </Card.Content>
      <Card.Footer>
        <p className="text-muted text-sm">
          {baselineClose !== null && baselineDate ? (
            <>
              From {levelFormatter.format(baselineClose)} on{' '}
              {dateFormatter.format(baselineDate)}
            </>
          ) : latestClose === null ? (
            'No market data for this index.'
          ) : (
            'Not enough history for a year-to-date figure.'
          )}
        </p>
      </Card.Footer>
    </Card>
  );
}
