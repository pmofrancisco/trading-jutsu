'use server'

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import { z } from "zod";

const CreateCurrencyPairSchema = z.object({
  baseCurrency: z.string().min(1),
  quoteCurrency: z.string().min(1),
});

export default async function createForexCurrencyPair(
  formState: { errors: { baseCurrency?: string[]; quoteCurrency?: string[] } },
  formData: FormData
) {
  const baseCurrency = formData.get('base-currency') as string;
  const quoteCurrency = formData.get('quote-currency') as string;
  
  const validationResult = CreateCurrencyPairSchema.safeParse({ baseCurrency, quoteCurrency });

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  await prisma.forexCurrencyPair.create({
    data: {
      baseCurrency,
      quoteCurrency,
    },
  });

  redirect('/forex/currency-pairs');
}