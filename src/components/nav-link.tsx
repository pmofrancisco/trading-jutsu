import { paths } from '@/paths';
import Link from 'next/link';

/**
 * Whether `href` names the section the visitor is in, as opposed to the exact
 * page they are on. Most routes match their subpaths too, which is what keeps
 * "PH Stocks" lit while the visitor is on `/ph-stocks/indices-performance`.
 *
 * `/` is the exception, and has to match exactly: it is the prefix of every
 * other route, so prefix-matching it would light it on every page in the app.
 * Nothing in the header links there anymore — see the note on `navItems` — but
 * the rule stays, because it is a property of the path and not of the caller.
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === paths.home()) return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * One navigation row, shared by every navigation in the app — the header's
 * drawer stacks these, its desktop bar lays them out in a line, and a section's
 * nested menu reuses them so the active state looks and reads the same at every
 * level.
 *
 * `pathname` rather than a caller-computed flag because the highlight and
 * `aria-current` are not the same question. A parent whose child route is open
 * is highlighted — it is the section you are in — but it is not the page you
 * are on, and marking both it and its child `aria-current="page"` would
 * announce two current pages in the same navigation.
 *
 * `Icon` is optional: a nested item sits under a parent that already carries
 * one, and repeating icons there only adds noise. `onNavigate` is how the
 * drawer and the desktop menu close themselves on a click; navigations with
 * nothing to close omit it.
 */
export default function NavLink({
  href,
  label,
  Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon?: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      // Conveys the highlight to a screen reader, which cannot see the
      // background colour.
      aria-current={pathname === href ? 'page' : undefined}
      onClick={onNavigate}
      /*
       * `focus-visible:status-focused` is the ring HeroUI's own controls draw
       * — the utility their CSS applies, applied directly, rather than the
       * hand-rolled `outline` that used to stand in for it and drew a visibly
       * different indicator beside every button in the same bar. A bare `<a>`
       * gets none of a `Button`'s styling, so without it these would be the
       * only interactive elements in the app with a browser-default outline.
       */
      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors focus-visible:status-focused ${
        isActive(pathname, href)
          ? 'bg-accent-soft text-accent-soft-foreground font-medium'
          : 'text-muted hover:bg-surface-hover hover:text-foreground'
      }`}
    >
      {/*
       * `aria-hidden`: the label already names the destination. `shrink-0`: a
       * flex child may be shrunk past its `width` attribute, which would squash
       * the icon rather than wrap the label.
       */}
      {Icon && <Icon aria-hidden className="shrink-0" />}
      {label}
    </Link>
  );
}
