import type {
  IndexPerformance,
  PerformancePeriod,
} from '@/features/ph-stocks/data/dto';
import {
  formatDate,
  formatLevel,
  formatPercent,
  toneClassName,
} from '@/features/ph-stocks/ui/format';
import { Card } from '@heroui/react';

/**
 * How each period is spelled out in the footer. The tab above the card is
 * labelled with the abbreviation, which is enough while reading a column of
 * figures; a sentence explaining why there is no figure is not the place to make
 * someone expand "QTD" for themselves.
 */
const PERIOD_NAMES: Record<PerformancePeriod, string> = {
  ytd: 'year-to-date',
  qtd: 'quarter-to-date',
  mtd: 'month-to-date',
};

/**
 * One index's move over one period.
 *
 * The period arrives as a key rather than as the `PeriodPerformance` itself, so
 * the figures and the word naming them are drawn from the same place — a card
 * cannot be handed the quarter's numbers under the year's name.
 */
export default function IndexPerformanceCard({
  performance,
  period,
}: {
  performance: IndexPerformance;
  period: PerformancePeriod;
}) {
  const { symbol, name, latestClose, asOf, periods } = performance;
  const { baselineClose, baselineDate, changePercent } = periods[period];

  return (
    <Card>
      <Card.Header>
        <Card.Title>{symbol}</Card.Title>
        <Card.Description>{name}</Card.Description>
      </Card.Header>
      <Card.Content className="gap-1">
        <p
          className={`text-3xl font-bold tabular-nums ${
            changePercent === null ? 'text-muted' : toneClassName(changePercent)
          }`}
        >
          {changePercent === null ? '—' : formatPercent(changePercent)}
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
            `Not enough history for a ${PERIOD_NAMES[period]} figure.`
          )}
        </p>
      </Card.Footer>
    </Card>
  );
}
