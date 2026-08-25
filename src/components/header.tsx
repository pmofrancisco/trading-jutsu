'use client';

import NavLink from '@/components/nav-link';
import SiteHeader from '@/components/site-header';
import ThemeSwitch from '@/components/theme-switch';
import type { SessionUser } from '@/features/auth/data/session';
import UserMenu from '@/features/auth/ui/user-menu';
import { paths } from '@/paths';
import {
  ArrowRightArrowLeft,
  Bars,
  ChartLine,
  ChevronDown,
  CircleDollar,
  Cubes3,
  LayoutCells,
} from '@gravity-ui/icons';
import { Button, Drawer, Popover } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  /**
   * The section's own pages, if it has more than the one at `href`. Named
   * `pages` rather than `children` so it is never mistaken for React's own
   * prop, which the components below also take.
   */
  pages?: { href: string; label: string }[];
}

/**
 * The navigation, in render order. Every `href` comes from `paths` — see the
 * note there on route strings living in exactly one place. The icons render at
 * 16px with `fill: currentColor` by default, so they inherit the row's text
 * colour and need no sizing of their own.
 *
 * A section's pages are nested under it rather than promoted to the top level:
 * the bar has room for a handful of items, and the two market sections have
 * pages of their own.
 *
 * `/` is deliberately absent. It is the public landing page, and this header
 * only ever renders for someone who is past it — Dashboard is where the app
 * starts once there is a session.
 */
const navItems: NavItem[] = [
  { href: paths.dashboard(), label: 'Dashboard', Icon: LayoutCells },
  { href: paths.crypto.index(), label: 'Crypto', Icon: Cubes3 },
  { href: paths.forex.index(), label: 'Forex', Icon: ArrowRightArrowLeft },
  {
    href: paths.phStocks.index(),
    label: 'PH Stocks',
    Icon: ChartLine,
    pages: [
      {
        href: paths.phStocks.gainersAndLosers(),
        label: 'Gainers and Losers',
      },
      {
        href: paths.phStocks.indicesPerformance(),
        label: 'Indices Performance',
      },
      {
        href: paths.phStocks.leaders(),
        label: 'Leaders',
      },
    ],
  },
  {
    href: paths.usStocks.index(),
    label: 'US Stocks',
    Icon: CircleDollar,
    pages: [
      {
        href: paths.usStocks.gainersAndLosers(),
        label: 'Gainers and Losers',
      },
    ],
  },
];

/**
 * A section in the desktop bar, as a link plus a disclosure for its pages.
 *
 * The two are separate controls on purpose. Turning the section itself into the
 * menu's trigger is the more common pattern, but it would cost `/ph-stocks` its
 * only link in the app — a keyboard or screen-reader user would have to open a
 * menu to reach a page that is perfectly reachable on its own. Nesting a button
 * inside the `<a>` is not an option either; interactive elements cannot nest,
 * so they sit side by side.
 *
 * A `Popover` of real `<Link>`s rather than a `Dropdown`, for the same reason
 * `UserMenu` is a dialog: React Aria's menu items navigate through its own
 * router integration, which this app does not install, so their `href` would
 * cost a full page load where `next/link` navigates on the client.
 */
function SectionNavItem({
  href,
  label,
  Icon,
  pages,
  pathname,
}: {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  pages: { href: string; label: string }[];
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center">
      <NavLink href={href} label={label} Icon={Icon} pathname={pathname} />
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        {/*
         * `aria-label`: an icon-only `Button` adds no accessible name of its
         * own, and "button" alone would not say which section it opens. React
         * Aria supplies the `aria-expanded`/`aria-haspopup` pairing.
         */}
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={`${label} pages`}
        >
          {/*
           * `motion-reduce:transition-none` for the same reason HeroUI's own
           * controls carry it: a half-turn is decoration, and the state it
           * decorates is already carried by `aria-expanded`.
           */}
          <ChevronDown
            aria-hidden
            className={`transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
        {/*
         * The trigger is the chevron, so the panel is anchored to it: `start`
         * lines their left edges up and lets the panel open rightwards, back
         * under the label. `min-w` keeps it from collapsing to the width of the
         * chevron it hangs from.
         */}
        <Popover.Content className="p-1 min-w-52" placement="bottom start">
          {/*
           * The panel is portalled out of the header, so it carries its own
           * landmark rather than relying on the "Main" `<nav>` it renders from.
           */}
          <nav aria-label={label}>
            <ul className="flex flex-col gap-1">
              {pages.map((page) => (
                <li key={page.href}>
                  <NavLink
                    href={page.href}
                    label={page.label}
                    pathname={pathname}
                    onNavigate={() => setIsOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </Popover.Content>
      </Popover>
    </div>
  );
}

/**
 * The signed-in bar: `SiteHeader`'s frame — the same one `/` and `/sign-in`
 * wear, down to the height, the gutter and the mark's position — carrying the
 * navigation those pages have no session to offer.
 *
 * `fluid`, unlike them: the signed-in pages are full-bleed, and a bar that
 * stopped at `max-w-6xl` would float above a grid that does not.
 *
 * The mark leads to the dashboard, not to `/`. The convention is that a logo
 * leads home, but home here is the public landing page — a signed-in visitor
 * clicking the mark wants the app, not the page that exists to explain it to
 * strangers. It carries no `aria-current`: on `/dashboard` the navigation's own
 * "Dashboard" link is already marked, and two current pages in one bar is one
 * more than there can be.
 *
 * Client-only for the drawer state and the active-route highlight. The user
 * arrives as a prop from the server rather than from `useSession()`, so there
 * is no client-side session fetch and no flash of signed-out UI on first paint.
 */
export default function Header({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <SiteHeader
      brandHref={paths.dashboard()}
      fluid
      start={
        /*
         * The drawer is the small-screen navigation only — above `sm` the same
         * items are in the bar itself, where hiding them behind a button would
         * cost a click for nothing. It is also `SiteHeader`'s `start` contract:
         * the mark reclaims the row's leading edge exactly where this goes.
         */
        <div className="sm:hidden">
          <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
            {/*
             * `aria-label`: the Gravity icons render a bare `<svg>` with no
             * `<title>`, and an icon-only `Button` adds no name of its own, so
             * without this the control that opens the navigation announces
             * itself as "button".
             *
             * `lg` for its height, not its emphasis, and for the same reason the
             * landing page's "Sign in" is: it is the only size HeroUI gives that
             * clears 44px on a touch screen (`h-11`, dropping to `h-10` from
             * `md` up). This is the only way to the navigation on a phone, so it
             * is the last control in the app that should be a small target.
             */}
            <Button
              isIconOnly
              size="lg"
              variant="ghost"
              aria-label="Open navigation"
            >
              <Bars />
            </Button>
            <Drawer.Backdrop>
              <Drawer.Content placement="left">
                <Drawer.Dialog>
                  <Drawer.Body>
                    <nav aria-label="Main">
                      <ul className="flex flex-col gap-1">
                        {navItems.map(({ href, label, Icon, pages }) => (
                          <li key={href}>
                            <NavLink
                              href={href}
                              label={label}
                              Icon={Icon}
                              pathname={pathname}
                              onNavigate={() => setIsOpen(false)}
                            />
                            {/*
                             * The drawer is already an open panel, so a
                             * section's pages are nested in place rather than
                             * behind a second disclosure — one tap to reach
                             * them instead of two. A nested `<ul>` is what
                             * conveys the hierarchy to a screen reader; the
                             * rule and indent are for everyone else.
                             */}
                            {pages && (
                              <ul className="mt-1 ml-5 flex flex-col gap-1 border-l border-l-border pl-2">
                                {pages.map((page) => (
                                  <li key={page.href}>
                                    <NavLink
                                      href={page.href}
                                      label={page.label}
                                      pathname={pathname}
                                      onNavigate={() => setIsOpen(false)}
                                    />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </Drawer.Body>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      }
      nav={
        /*
         * `hidden`/`display: none` takes this out of the accessibility tree as
         * well as the layout, so only one of the two navigations is ever
         * exposed and the duplicate "Main" label is never ambiguous.
         */
        <nav aria-label="Main" className="ml-2 hidden sm:block">
          <ul className="flex items-center gap-1">
            {navItems.map(({ href, label, Icon, pages }) => (
              <li key={href}>
                {pages ? (
                  <SectionNavItem
                    href={href}
                    label={label}
                    Icon={Icon}
                    pages={pages}
                    pathname={pathname}
                  />
                ) : (
                  <NavLink
                    href={href}
                    label={label}
                    Icon={Icon}
                    pathname={pathname}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>
      }
    >
      <ThemeSwitch />
      <UserMenu user={user} />
    </SiteHeader>
  );
}
