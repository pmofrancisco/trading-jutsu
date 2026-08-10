import type { CurrencyPairSummary } from '@/features/forex/data/dto';
import { paths } from '@/paths';
import { Table } from '@heroui/react';
import Link from 'next/link';

export default function CurrencyPairTable({
  pairs,
}: {
  pairs: CurrencyPairSummary[];
}) {
  return (
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
                  <Link href={paths.admin.forex.currencyPair(pair.id)}>
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
  );
}
