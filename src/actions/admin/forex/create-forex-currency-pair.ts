'use server';

import { prisma } from '@/lib/prisma';
import { paths } from '@/paths';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createCurrencyPairSchema = z.object({
  baseCurrency: z.string().min(1),
  quoteCurrency: z.string().min(1),
});

interface ICreateForexCurrencyPairFormState {
  errors: {
    baseCurrency?: string[];
    quoteCurrency?: string[];
    _form?: string[];
  };
}

export async function createForexCurrencyPair(
  formState: ICreateForexCurrencyPairFormState,
  formData: FormData,
): Promise<ICreateForexCurrencyPairFormState> {
  const baseCurrency = formData.get('base-currency') as string;
  const quoteCurrency = formData.get('quote-currency') as string;

  const validationResult = createCurrencyPairSchema.safeParse({
    baseCurrency,
    quoteCurrency,
  });

  if (!validationResult.success) {
    return { errors: z.flattenError(validationResult.error).fieldErrors };
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
        errors: { baseCurrency: [], quoteCurrency: [], _form: [err.message] },
      };
    } else {
      return {
        errors: {
          baseCurrency: [],
          quoteCurrency: [],
          _form: ['Something went wrong'],
        },
      };
    }
  }

  revalidatePath(paths.admin.forex.currencyPairList());
  redirect(paths.admin.forex.currencyPairList());
}
