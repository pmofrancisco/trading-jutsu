import Mark, { markColor } from '@/components/mark';
import CtaLink from '@/features/marketing/ui/cta-link';
import { container, sectionIds } from '@/features/marketing/ui/section';
import { paths } from '@/paths';
import { Chip, Typography } from '@heroui/react';

/**
 * The markets the systems run on, as a plain line of text under the buttons.
 * Short facts rather than a logo wall: this app has no customer logos to show,
 * and inventing them is the one kind of social proof that is a lie rather than
 * a claim.
 *
 * The four markets in coverage order, with the price last — it is the fact that
 * answers the objection the other four raise.
 */
const proofPoints = [
  'Philippine equities',
  'US equities',
  'Crypto',
  'Forex',
  'Free to start',
];

/**
 * The first screen: what this is, who it is for, and the one thing to do next.
 *
 * Not wrapped in `<Section />`. That component exists to give the page's middle
 * bands a shared rule, eyebrow and `<h2>`; the hero has an `<h1>`, no rule above
 * it, and a background of its own, and forcing it through the same shell would
 * mean a prop for each of those differences.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/*
       * Two decorative layers, both `aria-hidden` and neither in the flow.
       *
       * The wash is the mark's red rather than the theme's accent blue: it is
       * the only colour this app owns, and a hero that glows in it reads as
       * this product's hero at a glance. `color-mix` keeps it a tint — at full
       * strength it would fight the text for attention and lose it the
       * contrast. `markColor` is imported rather than written out again for the
       * same reason `app/icon.tsx` imports it: one red, one definition.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
        style={{
          background: `radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, ${markColor} 20%, transparent), transparent 72%)`,
        }}
      />
      {/*
       * The mark again, oversized and nearly invisible, as the texture behind
       * the copy. `opacity-[0.03]` is low enough that it never competes with
       * body text for contrast and is not carrying any meaning of its own — the
       * legible mark is in the header. `<Mark />` is already `aria-hidden`, so
       * there is nothing here for a screen reader to skip past.
       */}
      <Mark className="pointer-events-none absolute top-8 -right-24 size-[32rem] opacity-[0.03] sm:-right-16" />

      <div className={`${container} relative py-20 sm:py-28 lg:py-36`}>
        <div className="max-w-3xl">
          {/* A bare string child: `Chip` wraps it in its own `Chip.Label`. */}
          <Chip variant="soft" color="accent" size="sm">
            Six systems · Three ranks · One dashboard
          </Chip>
          {/*
           * `level={1}` gives the element; the size comes from a utility
           * because HeroUI's stock `h1` is `text-4xl` at every width, which is
           * too small to anchor a hero on a desktop and too large to wrap
           * cleanly on a phone. Tailwind's `utilities` layer outranks the
           * `components` layer HeroUI styles headings from, so it wins.
           *
           * `text-balance` keeps the last line from falling to a single orphan
           * word once the heading wraps.
           */}
          <Typography.Heading
            level={1}
            weight="bold"
            className="mt-6 text-4xl tracking-tight text-balance sm:text-6xl"
          >
            Trade with a system, not a hunch.
          </Typography.Heading>
          <Typography.Paragraph
            color="muted"
            className="mt-6 max-w-2xl text-lg sm:text-xl"
          >
            Trading Jutsu runs a library of rule-based trading systems — trend
            following, momentum, mean reversion and more — across Philippine and
            US equities, crypto and forex, and shows you what each one is
            signalling today.
          </Typography.Paragraph>
          {/*
           * `flex-wrap` rather than a breakpoint: the two buttons fit side by
           * side on most phones and drop to two rows on the narrowest, without
           * a width having to be guessed in advance.
           */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <CtaLink href={paths.signIn()}>Start free as a Genin</CtaLink>
            <CtaLink href={`#${sectionIds.systems}`} variant="outline">
              See the systems
            </CtaLink>
          </div>
          {/*
           * A list, not a sentence with separators typed into it: the bullets
           * are drawn by the layout, so a screen reader announces four items
           * rather than one run-on line punctuated by middots.
           */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            {proofPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 before:size-1.5 before:rounded-full before:bg-muted before:content-['']"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
