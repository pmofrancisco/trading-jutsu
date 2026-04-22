'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Avatar, Button, Drawer, Popover } from '@heroui/react';
import { Bars } from '@gravity-ui/icons';

import { paths } from '@/paths';

import { signOut } from '@/actions';

export default function Header() {
  const session = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex p-2 border-b border-b-gray-100 items-center justify-between">
      <div className="flex items-center gap-2">
        <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
          <Button isIconOnly variant="ghost">
            <Bars />
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="left">
              <Drawer.Dialog>
                <Drawer.Body className="flex flex-col gap-2">
                  <Link href="/crypto" onClick={() => setIsOpen(false)}>
                    Crypto
                  </Link>
                  <Link href="/forex" onClick={() => setIsOpen(false)}>
                    Forex
                  </Link>
                  <Link href="/pse" onClick={() => setIsOpen(false)}>
                    PSE
                  </Link>
                  <div className="font-bold border-t border-gray-100 pt-2">
                    Admin
                  </div>
                  <Link
                    href={paths.admin.forex.currencyPairList()}
                    onClick={() => setIsOpen(false)}
                  >
                    Forex Currency Pairs
                  </Link>
                  <Link
                    href="/admin/pse/sectors"
                    onClick={() => setIsOpen(false)}
                  >
                    PSE Sectors
                  </Link>
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
        <Link className="font-bold" href="/">
          Trading Jutsu
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div>{session.data?.user?.email}</div>
        <Popover>
          <Button variant="ghost" isIconOnly>
            <Avatar className="size-8">
              <Avatar.Image
                src={session.data?.user?.image || ''}
                alt={session.data?.user?.name || 'User'}
              />
            </Avatar>
          </Button>
          <Popover.Content className="p-4">
            <div className="font-bold">{session.data?.user?.name}</div>
            <div className="mb-3">{session.data?.user?.email}</div>
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
