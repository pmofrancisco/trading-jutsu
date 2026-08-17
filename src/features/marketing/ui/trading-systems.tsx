import Section, { sectionIds } from '@/features/marketing/ui/section';
import {
  ArrowRightArrowLeft,
  ArrowShapeUpFromLine,
  ChartLineArrowUp,
  Pulse,
  ScalesBalanced,
  Thunderbolt,
} from '@gravity-ui/icons';
import { Card, Chip, Typography } from '@heroui/react';

interface TradingSystem {
  name: string;
  /** What the system does, in the trader's own terms rather than the code's. */
  summary: string;
  /** The single sentence that says when it makes money — and when it does not. */
  edge: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  /** The lowest rank that can run it. Ties this section to the pricing below. */
  rank: 'Genin' | 'Chunin' | 'Jonin';
}

/**
 * The product, in render order — easiest to grasp first, most specialised last,
 * which is also the order the ranks unlock them in.
 *
 * Data rather than six hand-written cards, for the same reason `navItems` is
 * data in the header: the cards differ only in their words, and a list makes
 * that obvious and keeps a seventh system to one entry rather than one copied
 * block.
 */
const tradingSystems: TradingSystem[] = [
  {
    name: 'Trend Following',
    summary:
      'Ride the move until it ends. Enters in the direction of the primary trend and holds while the trend keeps making higher highs.',
    edge: 'Pays in long directional runs, bleeds in chop.',
    Icon: ChartLineArrowUp,
    rank: 'Genin',
  },
  {
    name: 'Momentum',
    summary:
      'Buy relative strength. Ranks the whole universe by risk-adjusted return and rotates into what is already outrunning it.',
    edge: 'Pays while leadership persists, turns hard at reversals.',
    Icon: Thunderbolt,
    rank: 'Chunin',
  },
  {
    name: 'Mean Reversion',
    summary:
      'Fade the stretch. Enters when price snaps far from its own anchor and exits as it comes back home.',
    edge: 'Pays in ranges, and is the first thing a trend punishes.',
    Icon: ScalesBalanced,
    rank: 'Chunin',
  },
  {
    name: 'Breakout',
    summary:
      'Trade the end of the range. Triggers when price clears a level that has held repeatedly, on expanding range and volume.',
    edge: 'A few large winners paying for a long tail of false starts.',
    Icon: ArrowShapeUpFromLine,
    rank: 'Chunin',
  },
  {
    name: 'Volatility Regime',
    summary:
      'Know when to press. Classifies each market as calm, expanding or shocked, and scales every other system’s exposure to match.',
    edge: 'Rarely the trade itself — usually the reason the trade is sized right.',
    Icon: Pulse,
    rank: 'Jonin',
  },
  {
    name: 'Pairs & Relative Value',
    summary:
      'Trade the spread, not the market. Holds two correlated instruments against each other and takes the divergence between them.',
    edge: 'Indifferent to market direction, exposed to a broken correlation.',
    Icon: ArrowRightArrowLeft,
    rank: 'Jonin',
  },
];

/**
 * The colour a rank's chip wears, kept identical here and in the pricing table
 * so "Chunin" means the same thing in both places without the visitor having to
 * work out that it does.
 */
const rankChipColor = {
  Genin: 'success',
  Chunin: 'accent',
  Jonin: 'warning',
} as const;

export default function TradingSystems() {
  return (
    <Section
      id={sectionIds.systems}
      eyebrow="The scrolls"
      title="Complete systems, not loose signals"
      lede="Each one is a full set of rules — entry, exit, position size — applied the same way every day across every market we cover. You see what fired, why it fired, and what the same rule did the last hundred times it did."
    >
      {/*
       * A list, so the six read as six to a screen reader rather than as an
       * undifferentiated run of headings. `sm:grid-cols-2 lg:grid-cols-3` is
       * mobile-first: one column is the base, and the wider layouts are the
       * exceptions that earn a breakpoint.
       */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tradingSystems.map(({ Icon, edge, name, rank, summary }) => (
          <li key={name}>
            {/*
             * `h-full`: grid rows stretch their items, but the `Card` is the
             * item's child, so without this a short card floats in a tall row
             * and the row's bottom edges stop lining up.
             */}
            <Card className="h-full">
              <Card.Header className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  {/*
                   * A tinted plate behind the glyph rather than a bare icon:
                   * at 16px on a card this size the icon alone reads as a
                   * stray mark. `aria-hidden` on both — the title names the
                   * system, and the icon adds nothing a screen reader can use.
                   */}
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground"
                  >
                    <Icon className="size-5" />
                  </span>
                  {/*
                   * The chip says which rank unlocks the system, so the reader
                   * arrives at the pricing already knowing what they are
                   * buying. The visible text carries it — colour alone would
                   * leave the same information out of reach of anyone who
                   * cannot distinguish the three.
                   */}
                  <Chip size="sm" variant="soft" color={rankChipColor[rank]}>
                    {rank}
                  </Chip>
                </div>
                {/*
                 * `Typography.Heading` rather than `Card.Title`: the title is
                 * hard-wired to an `<h3>`, which is right here, but its only
                 * size override is the `render` prop — a function, which this
                 * Server Component cannot hand to a client component. `level`
                 * takes a number and survives the boundary.
                 */}
                <Typography.Heading
                  level={3}
                  weight="semibold"
                  className="text-lg"
                >
                  {name}
                </Typography.Heading>
              </Card.Header>
              <Card.Content>
                <Typography.Paragraph color="muted" size="sm">
                  {summary}
                </Typography.Paragraph>
              </Card.Content>
              <Card.Footer className="border-t border-t-border pt-3">
                <p className="text-sm text-muted">
                  {/*
                   * Naming the failure mode as well as the edge. A page that
                   * only lists what a system wins on is the kind of page a
                   * trader has learned to discount on sight.
                   */}
                  <span className="font-medium text-foreground">Edge:</span>{' '}
                  {edge}
                </p>
              </Card.Footer>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
