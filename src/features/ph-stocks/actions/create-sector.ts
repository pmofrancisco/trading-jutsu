'use server';

import { createSector } from '@/features/ph-stocks/data/sectors';
import { toUnexpectedFormError, type FormState } from '@/lib/form-state';
import { paths } from '@/paths';
import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { z } from 'zod';

const createSectorSchema = z.object({
  name: z.string().trim().min(1),
});

export type CreateSectorFormState = FormState<'name'>;

export async function createPhStocksSector(
  formState: CreateSectorFormState,
  formData: FormData,
): Promise<CreateSectorFormState> {
  const validationResult = createSectorSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validationResult.success) {
    return { errors: z.flattenError(validationResult.error).fieldErrors };
  }

  try {
    await createSector(validationResult.data);
  } catch (err) {
    // Lets `redirect()` from the data layer's auth gate through untouched.
    unstable_rethrow(err);
    return toUnexpectedFormError(err);
  }

  revalidatePath(paths.admin.phStocks.sectorList());
  redirect(paths.admin.phStocks.sectorList());
}
