'use client';

import { createForexCurrencyPair } from '@/actions';
import { Button } from '@heroui/react';
import { startTransition, useActionState } from 'react';

export default function NewCurrencyPair() {
  const [formState, action] = useActionState(createForexCurrencyPair, {
    errors: {},
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new Forex Currency Pair</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
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
