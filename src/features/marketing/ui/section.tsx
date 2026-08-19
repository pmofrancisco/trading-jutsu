import { container } from '@/components/container';
import { Typography } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * The landing page's own anchors. Not in `paths` — those are routes, and these
 * name places *within* one page rather than pages the router can reach. They
 * live here because the header links to them and the sections answer to them,
 * and a fragment spelled two ways is a link that silently goes nowhere.
 */
export const sectionIds = {
  systems: 'systems',
  testimonials: 'testimonials',
  pricing: 'pricing',
} as const;

/**
 * One band of the landing page: a rule, an eyebrow, a heading, an optional
 * lede, then whatever the section is actually made of.
 *
 * The heading is wired to the `<section>` with `aria-labelledby` rather than
 * left to sit inside it, so the landmark is announced by name — that is what
 * turns "region" into "Pricing" in a screen reader's landmark list, and it is
 * the only way the page's five bands are distinguishable without reading them.
 *
 * `scroll-mt-16` clears the sticky header. Without it the browser scrolls the
 * anchor to the top of the viewport, which is underneath the bar, and the
 * heading the visitor clicked to reach is the one thing they cannot see.
 */
export default function Section({
  children,
  eyebrow,
  id,
  lede,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  id: string;
  lede?: string;
  title: string;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-16 border-t border-t-border"
    >
      <div className={`${container} py-20 sm:py-28`}>
        {/*
         * `max-w-2xl` on the intro alone, not on the section: a measure of
         * roughly 70 characters is what keeps the lede readable, while the
         * cards below want the full width to lay out in three columns.
         */}
        <div className="max-w-2xl">
          {/*
           * Presentational, and deliberately not a heading — it is a label for
           * the `<h2>` under it, and marking it up as one would put a second,
           * emptier entry in every screen reader's heading list.
           */}
          <p className="text-sm font-medium tracking-widest text-muted uppercase">
            {eyebrow}
          </p>
          <Typography.Heading
            id={headingId}
            level={2}
            weight="semibold"
            className="mt-3 text-3xl tracking-tight text-balance sm:text-4xl"
          >
            {title}
          </Typography.Heading>
          {lede && (
            <Typography.Paragraph color="muted" className="mt-4 text-lg">
              {lede}
            </Typography.Paragraph>
          )}
        </div>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}
