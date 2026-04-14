import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CurrencyPairs() {
  const pairs = await prisma.forexCurrencyPair.findMany();

  return (
    <div>
      <Link href="/forex">Back</Link>
      <h1>Currency Pairs</h1>
      <ul>
        {pairs.map((pair) => (
          <li key={pair.id}>{pair.baseCurrency}/{pair.quoteCurrency}</li>
        ))}
      </ul>
      <Link href="/forex/currency-pairs/new">Add new</Link>
    </div>
  );
}