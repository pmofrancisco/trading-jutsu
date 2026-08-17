import { markColor } from '@/components/mark';
import CtaLink from '@/features/marketing/ui/cta-link';
import { container } from '@/features/marketing/ui/section';
import { paths } from '@/paths';
import { Typography } from '@heroui/react';

/**
 * The page's last word, and the second placement of its primary action — the
 * first is in the hero, and a visitor who has read the whole page should not
 * have to scroll back up to act on it.
 *
 * Not a `<Section />`: it has no eyebrow, no lede and no grid, and its heading
 * is the call itself rather than a label for a band of content under it.
 */
export default function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-t border-t-border"
    >
      {/* The hero's wash, mirrored to close the page the way it opened. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[24rem]"
        style={{
          background: `radial-gradient(55% 60% at 50% 100%, color-mix(in oklab, ${markColor} 18%, transparent), transparent 72%)`,
        }}
      />
      <div className={`${container} relative py-20 text-center sm:py-28`}>
        {/*
         * `align` rather than the `text-center` on the wrapper: HeroUI gives
         * every `Typography` an alignment class of its own, which lands in the
         * `components` layer and beats the inherited value from the div above.
         */}
        <Typography.Heading
          align="center"
          id="final-cta-heading"
          level={2}
          weight="bold"
          className="text-3xl tracking-tight text-balance sm:text-4xl"
        >
          Your first system is free.
        </Typography.Heading>
        <Typography.Paragraph
          align="center"
          color="muted"
          className="mx-auto mt-4 max-w-xl text-lg"
        >
          Sign in and start with Trend Following today. Rank up to Chunin or
          Jonin whenever the systems — not the mood — say you are ready.
        </Typography.Paragraph>
        <div className="mt-8 flex justify-center">
          <CtaLink href={paths.signIn()}>Start free as a Genin</CtaLink>
        </div>
      </div>
    </section>
  );
}
