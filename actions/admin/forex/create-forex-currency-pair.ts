'use server';

import { prisma } from '@/lib/prisma';
import paths from '@/paths';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateCurrencyPairSchema = z.object({
  baseCurrency: z.string().min(1),
  quoteCurrency: z.string().min(1),
});

export async function createForexCurrencyPair(
  formState: {
    errors: { baseCurrency?: string[]; quoteCurrency?: string[] };
    message?: string;
  },
  formData: FormData,
) {
  const baseCurrency = formData.get('base-currency') as string;
  const quoteCurrency = formData.get('quote-currency') as string;

  const validationResult = CreateCurrencyPairSchema.safeParse({
    baseCurrency,
    quoteCurrency,
  });

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    await prisma.forexCurrencyPair.create({
      data: {
        baseCurrency,
        quoteCurrency,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      return {
        errors: { baseCurrency: [], quoteCurrency: [] },
        message: err.message,
      };
    } else {
      return {
        errors: { baseCurrency: [], quoteCurrency: [] },
        message: 'Something went wrong',
      };
    }
  }

  revalidatePath(paths.admin.forex.currencyPairList());
  redirect(paths.admin.forex.currencyPairList());
}
