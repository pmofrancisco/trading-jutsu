import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default function NewCurrencyPair() {
  async function createCurrencyPair(formData: FormData) {
    'use server';

    const baseCurrency = formData.get('base') as string;
    const quoteCurrency = formData.get('quote') as string;

    await prisma.forexCurrencyPair.create({
      data: {
        baseCurrency,
        quoteCurrency,
      },
    });

    redirect('/forex/currency-pairs');
  }

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new Forex Currency Pair</h1>
      <form className="flex flex-col gap-2" action={createCurrencyPair}>
        <label htmlFor="base">Base Currency:</label>
        <input type="text" id="base" name="base" required className="rounded border" />
        <label htmlFor="quote">Quote Currency:</label>
        <input type="text" id="quote" name="quote" required className="rounded border" />
        <button type="submit" className="rounded border">Save</button>
      </form>
    </div>
  );
}