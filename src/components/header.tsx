'use client';

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
} from '@gravity-ui/icons';
import { Avatar, Button, Drawer, Popover } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/**
 * The drawer's contents, in render order. Every `href` comes from `paths` — see
 * the note there on route strings living in exactly one place. The icons render
 * at 16px with `fill: currentColor` by default, so they inherit the row's text
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
 * Client-only for the drawer and popover state. The user arrives as a prop from
 * the server rather than from `useSession()`, so there is no client-side
 * session fetch and no flash of signed-out UI on first paint.
 */
export default function Header({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex p-2 border-b border-b-border items-center justify-between">
      <div className="flex items-center gap-2">
        <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
          <Button isIconOnly variant="ghost">
            <Bars />
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.Body>
                  <nav aria-label="Main">
                    <ul className="flex flex-col gap-1">
                      {navItems.map(({ href, label, Icon }) => {
                        const active = isActive(pathname, href);

                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              // Conveys the highlight to a screen reader, which
                              // cannot see the background colour.
                              aria-current={active ? 'page' : undefined}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                                active
                                  ? 'bg-accent-soft text-accent-soft-foreground font-medium'
                                  : 'text-muted hover:bg-surface-hover hover:text-foreground'
                              }`}
                            >
                              {/*
                               * `aria-hidden`: the label already names the
                               * destination. `shrink-0`: a flex child may be
                               * shrunk past its `width` attribute, which would
                               * squash the icon rather than wrap the label.
                               */}
                              <Icon aria-hidden className="shrink-0" />
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
        <Link className="font-bold" href={paths.home()}>
          Trading Jutsu
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitch />
        <Popover>
          <Button variant="ghost" isIconOnly>
            <Avatar className="size-8">
              <Avatar.Image src={user.image ?? ''} alt={user.name ?? 'User'} />
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
  );
}
