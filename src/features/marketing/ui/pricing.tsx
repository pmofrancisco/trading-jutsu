import CtaLink from '@/features/marketing/ui/cta-link';
import Section, { sectionIds } from '@/features/marketing/ui/section';
import { paths } from '@/paths';
import { CircleCheck, CrownDiamond, Medal, Star } from '@gravity-ui/icons';
import { Chip, Typography } from '@heroui/react';

interface Tier {
  name: string;
  /**
   * Dollars per month, as a number rather than a formatted string: the display
   * (`$0` vs `Free`, `/month` vs nothing) is a rendering decision, and baking it
   * into the data means changing a price and its presentation in two places.
   */
  monthlyUsd: number;
  tagline: string;
  features: string[];
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  cta: string;
  /** Exactly one tier carries this — see the note on `<TierCard />`. */
  isFeatured?: boolean;
}

/**
 * The three ranks, cheapest first, so the eye travels the same direction as the
 * price. Each tier names what it *adds*, and the list starts with the tier below
 * it, so nobody has to compare three lists line by line to find the difference.
 */
const tiers: Tier[] = [
  {
    name: 'Genin',
    monthlyUsd: 0,
    tagline: 'Learn one system properly before you run six badly.',
    Icon: Star,
    cta: 'Start free',
    features: [
      'Trend Following, in full',
      'PSE index performance and daily movers',
      'End-of-day signals',
      'Watchlist of 5 symbols',
      'One year of signal history',
    ],
  },
  {
    name: 'Chunin',
    monthlyUsd: 10,
    tagline: 'Four systems, every market, and the reports to compare them.',
    Icon: Medal,
    cta: 'Choose Chunin',
    isFeatured: true,
    features: [
      'Everything in Genin',
      'Adds Momentum, Mean Reversion and Breakout',
      'Adds US equities, crypto and forex',
      'Signals refreshed intraday',
      'Watchlist of 50 symbols',
      'Backtest reports with drawdown and hit rate',
    ],
  },
  {
    name: 'Jonin',
    monthlyUsd: 20,
    tagline: 'Every system, your own parameters, and alerts that reach you.',
    Icon: CrownDiamond,
    cta: 'Choose Jonin',
    features: [
      'Everything in Chunin',
      'Adds Volatility Regime and Pairs & Relative Value',
      'Tune parameters and add rules of your own',
      'Unlimited watchlist',
      'Real-time alerts by email and webhook',
      'API access to signals and history',
    ],
  },
];

/**
 * One rank.
 *
 * The featured tier is drawn with a ring and a chip rather than by being made
 * physically larger, which is the more common treatment: an oversized middle
 * card breaks the row's alignment and pushes the third tier's features out of
 * line with the second's, which is the one comparison this section exists to
 * make easy.
 */
function TierCard({
  Icon,
  cta,
  features,
  isFeatured,
  monthlyUsd,
  name,
  tagline,
}: Tier) {
  const isFree = monthlyUsd === 0;

  return (
    // Not a HeroUI `Card`: the featured ring and the extra padding this needs
    // would be fighting `.card`'s own `p-4` and radius the whole way, and there
    // is nothing left of the component underneath that.
    <div
      className={`flex h-full flex-col gap-6 rounded-3xl p-6 shadow-surface ${
        isFeatured
          ? 'bg-surface ring-2 ring-accent'
          : 'bg-surface ring-1 ring-border'
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon aria-hidden className="size-5 shrink-0 text-accent" />
            <Typography.Heading level={3} weight="semibold" className="text-xl">
              {name}
            </Typography.Heading>
          </div>
          {/*
           * Text, not just the ring: the ring says "this one is different"
           * without saying why, and says nothing at all to a screen reader.
           */}
          {isFeatured && (
            <Chip size="sm" variant="primary" color="accent">
              Most popular
            </Chip>
          )}
        </div>
        <Typography.Paragraph color="muted" size="sm">
          {tagline}
        </Typography.Paragraph>
      </div>

      <p className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight tabular-nums">
          {isFree ? 'Free' : `$${monthlyUsd}`}
        </span>
        {/*
         * The currency is spelled out for a screen reader, which reads `$` as
         * "dollar" with no idea which country's. Sighted readers get it from
         * the "Prices in US dollars" line under the grid instead of from a
         * "USD" repeated three times across the row.
         */}
        {!isFree && (
          <span className="text-muted">
            <span className="sr-only">US dollars </span>per month
          </span>
        )}
        {isFree && <span className="text-muted">forever</span>}
      </p>

      {/*
       * The button before the feature list, so all three calls to action sit on
       * the same line across the row — three lists of different lengths would
       * otherwise put them at three different heights, and the visitor would
       * have to hunt for the one they want.
       */}
      <CtaLink
        href={paths.signIn()}
        variant={isFeatured ? 'primary' : 'outline'}
        className="w-full"
      >
        {cta}
      </CtaLink>

      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            {/*
             * `mt-0.5` optically centres a 16px glyph against the first line of
             * a 20px-tall label; `shrink-0` stops the flex row squashing it
             * when the label wraps to two lines.
             */}
            <CircleCheck
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-success"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  return (
    <Section
      id={sectionIds.pricing}
      eyebrow="Ranks"
      title="Choose your rank"
      lede="Every rank runs the same engine on the same data. What changes is how many systems and markets you can put it to work on, how quickly you hear about them, and how much of the machinery you are allowed to touch."
    >
      {/*
       * Cards rather than a comparison table: a three-column table with six
       * feature rows has to either scroll horizontally on a phone or be rebuilt
       * as cards anyway, and each tier's list is short enough to read whole.
       *
       * `items-stretch` so the featured card's ring runs the full height of the
       * row instead of stopping short at its own content.
       */}
      <ul className="grid items-stretch gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <li key={tier.name}>
            <TierCard {...tier} />
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        Prices in US dollars, billed monthly. Change rank or cancel whenever you
        like — Genin stays free either way.
      </p>
    </Section>
  );
}
