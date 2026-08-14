import type { IndexPerformance } from '@/features/ph-stocks/data/dto';
import {
  formatDate,
  formatLevel,
  formatPercent,
  toneClassName,
} from '@/features/ph-stocks/ui/format';
import { Card } from '@heroui/react';

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
          {ytdPercent === null ? '—' : formatPercent(ytdPercent)}
        </p>
        {latestClose !== null && (
          <p className="tabular-nums">
            {formatLevel(latestClose)}
            {asOf && (
              <span className="text-muted text-sm">
                {' '}
                as of {formatDate(asOf)}
              </span>
            )}
          </p>
        )}
      </Card.Content>
      <Card.Footer>
        <p className="text-muted text-sm">
          {baselineClose !== null && baselineDate ? (
            <>
              From {formatLevel(baselineClose)} on {formatDate(baselineDate)}
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
