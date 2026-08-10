import type { QuoteSummary } from '@/features/forex/data/dto';

export default function QuoteList({ quotes }: { quotes: QuoteSummary[] }) {
  if (quotes.length === 0) {
    return <p>No quotes recorded yet.</p>;
  }

  return (
    <ul>
      {quotes.map((quote) => (
        <li key={quote.id}>
          <div>{quote.quoteDate.toLocaleDateString()}</div>
          <div>{quote.open}</div>
          <div>{quote.high}</div>
          <div>{quote.low}</div>
          <div>{quote.close}</div>
        </li>
      ))}
    </ul>
  );
}
