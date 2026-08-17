import { buttonVariants } from '@heroui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The variants this app's calls to action actually use, rather than the whole
 * of HeroUI's set. Narrow on purpose: a landing page with six button styles has
 * no primary action.
 */
type CtaVariant = 'primary' | 'outline';
type CtaSize = 'md' | 'lg';

/**
 * A call to action that navigates: HeroUI's `Button` renders a `<button>` and
 * cannot be given an `href` — its only escape hatch is the `render` prop, a
 * function, which a Server Component cannot hand to a client component.
 *
 * So the styling comes across on its own instead. `buttonVariants` returns the
 * same plain CSS class names HeroUI's own `Button` wears (`button
 * button--primary button--lg`), and those rules are written against `:hover`,
 * `:active` and `:disabled` as well as React Aria's data attributes — so an
 * `<a>` picks up the whole appearance, including the press animation.
 *
 * The focus ring is the exception. `.button` draws it from
 * `:focus-visible:not(:focus)` and `[data-focus-visible]`, and neither matches
 * a plain anchor — the first because an element that is `:focus-visible` is
 * always also `:focus`, the second because nothing sets the attribute without
 * React Aria. `focus-visible:status-focused` is the utility behind both, applied
 * directly, so the ring is HeroUI's own rather than an approximation of it.
 *
 * `next/link` rather than HeroUI's `Link`, which is a React Aria client
 * component and would navigate with a full page load: this app installs no
 * router integration for it.
 */
export default function CtaLink({
  children,
  className,
  href,
  size = 'lg',
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  href: string;
  size?: CtaSize;
  variant?: CtaVariant;
}) {
  const classNames = `${buttonVariants({ size, variant })} focus-visible:status-focused ${className ?? ''}`;

  // A fragment names a section of the page the visitor is already on, so there
  // is no navigation for the router to do — a bare `<a>` lets the browser
  // handle the scroll and the history entry itself.
  if (href.startsWith('#')) {
    return (
      <a href={href} className={classNames}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
}
