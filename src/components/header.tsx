'use client';

import ThemeSwitch from '@/components/theme-switch';
import { signOut } from '@/features/auth/actions/sign-out';
import type { SessionUser } from '@/features/auth/data/session';
import { paths } from '@/paths';
import { Bars } from '@gravity-ui/icons';
import { Avatar, Button, Drawer, Popover } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * Client-only for the drawer and popover state. The user arrives as a prop from
 * the server rather than from `useSession()`, so there is no client-side
 * session fetch and no flash of signed-out UI on first paint.
 */
export default function Header({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);

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
                <Drawer.Body className="flex flex-col gap-2">
                  <Link
                    href={paths.crypto.index()}
                    onClick={() => setIsOpen(false)}
                  >
                    Crypto
                  </Link>
                  <Link
                    href={paths.forex.index()}
                    onClick={() => setIsOpen(false)}
                  >
                    Forex
                  </Link>
                  <Link
                    href={paths.phStocks.index()}
                    onClick={() => setIsOpen(false)}
                  >
                    PH Stocks
                  </Link>
                  <div className="font-bold border-t border-border pt-2">
                    Admin
                  </div>
                  <Link
                    href={paths.admin.forex.currencyPairList()}
                    onClick={() => setIsOpen(false)}
                  >
                    Forex Currency Pairs
                  </Link>
                  <Link
                    href={paths.admin.phStocks.sectorList()}
                    onClick={() => setIsOpen(false)}
                  >
                    PH Stocks Sectors
                  </Link>
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
