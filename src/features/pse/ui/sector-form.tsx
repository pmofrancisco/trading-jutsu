'use client';

import { createPseSector } from '@/features/pse/actions/create-sector';
import { Button } from '@heroui/react';
import { startTransition, useActionState } from 'react';

export default function SectorForm() {
  const [formState, action] = useActionState(createPseSector, {
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
    <form className="flex flex-col gap-2" onSubmit={handleSubmit} noValidate>
      <label htmlFor="name">Sector Name:</label>
      <input type="text" id="name" name="name" className="rounded border" />
      <p className="text-red-500">{formState?.errors.name?.[0]}</p>
      <p className="text-red-500">{formState?.formError}</p>
      <Button type="submit" className="rounded border">
        Save
      </Button>
    </form>
  );
}
