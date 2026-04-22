'use client';

import { Bars } from '@gravity-ui/icons';
import { Button, Drawer } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex gap-2 p-2 bg-gray-100 items-center">
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
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
      <Link className="font-bold" href="/">
        Trading Jutsu
      </Link>
    </div>
  );
}
