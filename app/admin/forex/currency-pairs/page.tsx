import { Plus } from '@gravity-ui/icons';
import { Breadcrumbs, Button, Table } from '@heroui/react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CurrencyPairs() {
  const pairs = await prisma.forexCurrencyPair.findMany();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between w-full">
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href="/">Home</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>Admin Forex Currency Pairs</Breadcrumbs.Item>
        </Breadcrumbs>
        <Button isIconOnly variant="ghost">
          <Link href="/admin/forex/currency-pairs/new">
            <Plus />
          </Link>
        </Button>
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Column isRowHeader>Currency</Table.Column>
            </Table.Header>
            <Table.Body>
              {pairs.map((pair) => (
                <Table.Row key={pair.id}>
                  <Table.Cell>
                    <Link href={`/forex/currency-pairs/${pair.id}`}>
                      {pair.baseCurrency}
                      {pair.quoteCurrency}
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
