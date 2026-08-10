'use server';

import { createCurrencyPair } from '@/features/forex/data/currency-pairs';
import { toUnexpectedFormError, type FormState } from '@/lib/form-state';
import { paths } from '@/paths';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { z } from 'zod';

const createCurrencyPairSchema = z.object({
  baseCurrency: z.string().trim().min(1),
  quoteCurrency: z.string().trim().min(1),
});

export type CreateCurrencyPairFormState = FormState<
  'baseCurrency' | 'quoteCurrency'
>;

export async function createForexCurrencyPair(
  formState: CreateCurrencyPairFormState,
  formData: FormData,
): Promise<CreateCurrencyPairFormState> {
  const validationResult = createCurrencyPairSchema.safeParse({
    baseCurrency: formData.get('base-currency'),
    quoteCurrency: formData.get('quote-currency'),
  });

  if (!validationResult.success) {
    return { errors: z.flattenError(validationResult.error).fieldErrors };
  }

  try {
    await createCurrencyPair(validationResult.data);
  } catch (err) {
    // Lets `redirect()` from the data layer's auth gate through untouched.
    unstable_rethrow(err);
    return toUnexpectedFormError(err);
  }

  revalidatePath(paths.admin.forex.currencyPairList());
  redirect(paths.admin.forex.currencyPairList());
}
