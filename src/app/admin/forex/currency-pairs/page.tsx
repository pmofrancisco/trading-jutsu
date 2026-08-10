import { listCurrencyPairs } from '@/features/forex/data/currency-pairs';
import CurrencyPairTable from '@/features/forex/ui/currency-pair-table';
import { paths } from '@/paths';
import { Plus } from '@gravity-ui/icons';
import { Breadcrumbs, Button } from '@heroui/react';
import Link from 'next/link';

export default async function CurrencyPairs() {
  const pairs = await listCurrencyPairs();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between w-full">
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href={paths.home()}>Home</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>Admin Forex Currency Pairs</Breadcrumbs.Item>
        </Breadcrumbs>
        <Button isIconOnly variant="ghost">
          <Link href={paths.admin.forex.currencyPairCreate()}>
            <Plus />
          </Link>
        </Button>
      </div>
      <CurrencyPairTable pairs={pairs} />
    </div>
  );
}
