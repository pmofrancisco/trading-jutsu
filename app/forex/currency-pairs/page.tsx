import { prisma } from '@/lib/prisma';
import { Breadcrumbs, Table } from '@heroui/react';
import Link from 'next/link';

export default async function CurrencyPairs() {
  const pairs = await prisma.forexCurrencyPair.findMany();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Link href="/forex">Forex</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>Currency Pairs</Breadcrumbs.Item>
      </Breadcrumbs>
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
      <Link href="/forex/currency-pairs/new">Add new</Link>
    </div>
  );
}
