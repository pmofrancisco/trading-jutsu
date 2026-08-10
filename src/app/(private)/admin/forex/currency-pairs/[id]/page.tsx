import { getCurrencyPair } from '@/features/forex/data/currency-pairs';
import QuoteList from '@/features/forex/ui/quote-list';
import { paths } from '@/paths';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CurrencyPairProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CurrencyPair({ params }: CurrencyPairProps) {
  const { id } = await params;
  const currencyPairId = Number(id);

  if (!Number.isInteger(currencyPairId)) {
    notFound();
  }

  const currencyPair = await getCurrencyPair(currencyPairId);

  if (!currencyPair) {
    notFound();
  }

  return (
    <div>
      <Link href={paths.admin.forex.currencyPairList()}>Back</Link>
      <h1>
        {currencyPair.baseCurrency}/{currencyPair.quoteCurrency}
      </h1>
      <h2>Quotes</h2>
      <QuoteList quotes={currencyPair.quotes} />
    </div>
  );
}
