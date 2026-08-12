'use client';

import Mark from '@/components/mark';
import ThemeSwitch from '@/components/theme-switch';
import { signOut } from '@/features/auth/actions/sign-out';
import type { SessionUser } from '@/features/auth/data/session';
import { paths } from '@/paths';
import {
  ArrowRightArrowLeft,
  Bars,
  ChartLine,
  Cubes3,
  House,
  Person,
} from '@gravity-ui/icons';
import { Avatar, Button, Drawer, Popover } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * The navigation, in render order. Every `href` comes from `paths` — see the
 * note there on route strings living in exactly one place. The icons render at
 * 16px with `fill: currentColor` by default, so they inherit the row's text
 * colour and need no sizing of their own.
 */
const navItems = [
  { href: paths.home(), label: 'Home', Icon: House },
  { href: paths.crypto.index(), label: 'Crypto', Icon: Cubes3 },
  { href: paths.forex.index(), label: 'Forex', Icon: ArrowRightArrowLeft },
  { href: paths.phStocks.index(), label: 'PH Stocks', Icon: ChartLine },
];

/**
 * Home is `/`, the prefix of every other route, so it alone has to match
 * exactly. The rest also match their subpaths, keeping the section highlighted
 * once these routes grow children.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === paths.home()) return pathname === href;

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The focus ring HeroUI's own controls draw, as utilities. A bare `<a>` gets
 * none of a `Button`'s styling, so without this the links in this header are
 * the only interactive elements in the app with a browser-default focus
 * outline.
 */
const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

/**
 * One row, rendered in both navigations — the drawer stacks these, the desktop
 * bar lays them out in a line, and neither needs its own copy of the markup.
 * `onNavigate` is how the drawer closes itself on a click; the desktop bar has
 * nothing to close and omits it.
 */
function NavLink({
  href,
  label,
  Icon,
  isCurrent,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  isCurrent: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      // Conveys the highlight to a screen reader, which cannot see the
      // background colour.
      aria-current={isCurrent ? 'page' : undefined}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${focusRing} ${
        isCurrent
          ? 'bg-accent-soft text-accent-soft-foreground font-medium'
          : 'text-muted hover:bg-surface-hover hover:text-foreground'
      }`}
    >
      {/*
       * `aria-hidden`: the label already names the destination. `shrink-0`: a
       * flex child may be shrunk past its `width` attribute, which would squash
       * the icon rather than wrap the label.
       */}
      <Icon aria-hidden className="shrink-0" />
      {label}
    </Link>
  );
}

/**
 * The first letter of the first two words of a name — "Paul Michael Francisco"
 * becomes "PM". Empty when there is no name to read, which lets the caller fall
 * back to an icon rather than rendering an empty circle.
 */
function initials(name: string | null | undefined): string {
  if (!name) return '';

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Client-only for the drawer and popover state. The user arrives as a prop from
 * the server rather than from `useSession()`, so there is no client-side
 * session fetch and no flash of signed-out UI on first paint.
 */
export default function Header({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const userInitials = initials(user.name);

  return (
    // `sticky`: the PH Stocks grid is taller than the viewport, and the
    // navigation should not scroll away with it. The background is explicit
    // because a sticky element sits over content that would otherwise show
    // through it.
    <header className="sticky top-0 z-40 bg-background border-b border-b-border">
      <div className="flex p-2 items-center justify-between">
        <div className="flex items-center gap-2">
          {/*
           * The drawer is the small-screen navigation only — above `sm` the
           * same items are in the bar itself, where hiding them behind a button
           * would cost a click for nothing.
           */}
          <div className="sm:hidden">
            <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
              {/*
               * `aria-label`: the Gravity icons render a bare `<svg>` with no
               * `<title>`, and an icon-only `Button` adds no name of its own, so
               * without this the control that opens the navigation announces
               * itself as "button".
               */}
              <Button isIconOnly variant="ghost" aria-label="Open navigation">
                <Bars />
              </Button>
              <Drawer.Backdrop>
                <Drawer.Content placement="left">
                  <Drawer.Dialog>
                    <Drawer.Body>
                      <nav aria-label="Main">
                        <ul className="flex flex-col gap-1">
                          {navItems.map(({ href, label, Icon }) => (
                            <li key={href}>
                              <NavLink
                                href={href}
                                label={label}
                                Icon={Icon}
                                isCurrent={isActive(pathname, href)}
                                onNavigate={() => setIsOpen(false)}
                              />
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
          <Link
            href={paths.home()}
            aria-current={
              isActive(pathname, paths.home()) ? 'page' : undefined
            }
            className={`flex items-center gap-2 rounded-md px-2 py-1 font-bold tracking-tight transition-colors hover:bg-surface-hover ${focusRing}`}
          >
            <Mark className="size-5 shrink-0 text-accent" />
            Trading Jutsu
          </Link>
          {/*
           * `hidden`/`display: none` takes this out of the accessibility tree
           * as well as the layout, so only one of the two navigations is ever
           * exposed and the duplicate "Main" label is never ambiguous.
           */}
          <nav aria-label="Main" className="hidden sm:block ml-2">
            <ul className="flex items-center gap-1">
              {navItems.map(({ href, label, Icon }) => (
                <li key={href}>
                  <NavLink
                    href={href}
                    label={label}
                    Icon={Icon}
                    isCurrent={isActive(pathname, href)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitch />
          <Popover>
            <Button
              variant="ghost"
              isIconOnly
              aria-label={`Account: ${user.name ?? user.email ?? 'signed in'}`}
            >
              <Avatar className="size-8">
                {/*
                 * HeroUI's Avatar is Radix-based: the image unmounts when `src`
                 * is empty or fails to load, and the fallback takes its place.
                 * Without a fallback a GitHub account with no picture rendered
                 * an empty circle.
                 */}
                <Avatar.Image src={user.image ?? ''} alt="" />
                <Avatar.Fallback>
                  {userInitials || <Person aria-hidden />}
                </Avatar.Fallback>
              </Avatar>
            </Button>
            <Popover.Content className="p-4">
              <div className="font-bold">{user.name}</div>
              <div className="mb-3">{user.email}</div>
              <form action={signOut} className="w-full">
                <Button className="w-full" type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </Popover.Content>
          </Popover>
        </div>
      </div>
    </header>
  );
}
