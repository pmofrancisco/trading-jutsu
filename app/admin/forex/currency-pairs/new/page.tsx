'use client';

import { useActionState } from 'react';
import { Button } from '@heroui/react';
import { createForexCurrencyPair } from '@/actions';

export default function NewCurrencyPair() {
  const [formState, action] = useActionState(createForexCurrencyPair, {
    errors: { baseCurrency: [], quoteCurrency: [], _form: [] },
  });

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new Forex Currency Pair</h1>
      <form className="flex flex-col gap-2" action={action}>
        <label htmlFor="base-currency">Base Currency:</label>
        <input
          type="text"
          id="base-currency"
          name="base-currency"
          className="rounded border"
        />
        <p className="text-red-500">{formState?.errors.baseCurrency?.[0]}</p>
        <label htmlFor="quote-currency">Quote Currency:</label>
        <input
          type="text"
          id="quote-currency"
          name="quote-currency"
          className="rounded border"
        />
        <p className="text-red-500">{formState?.errors.quoteCurrency?.[0]}</p>
        <p className="text-red-500">{formState?.errors._form?.[0]}</p>
        <Button type="submit" className="rounded border">
          Save
        </Button>
      </form>
    </div>
  );
}
