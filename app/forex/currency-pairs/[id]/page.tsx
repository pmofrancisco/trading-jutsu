import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface CurrencyPairProps {
  params: Promise<{
    id: string;
  }>
}

export default async function CurrencyPair(props: CurrencyPairProps) {
  const { id } = await props.params;
  
  const currencyPair = await prisma.forexCurrencyPair.findFirst({
    where: {
      id: parseInt(id),
    },
    include: { quotes: true },
  });

  if (!currencyPair) {
    notFound();
  }

  return (
    <div>
      <Link href="/forex/currency-pairs">Back</Link>
      <h1>{currencyPair.baseCurrency}/{currencyPair.quoteCurrency}</h1>
      <h2>Quotes</h2>
      <ul>
        {currencyPair.quotes.map((quote) => (
          <li key={quote.id}>
            <div>{quote.quoteDate.toLocaleDateString()}</div>
            <div>{quote.open}</div>
            <div>{quote.high}</div>
            <div>{quote.low}</div>
            <div>{quote.close}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateStaticParams() {
  const currencyPairs = await prisma.forexCurrencyPair.findMany();
  return currencyPairs.map((pair) => ({ id: pair.id.toString() }));
}
