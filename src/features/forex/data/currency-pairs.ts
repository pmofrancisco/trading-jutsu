import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { prisma } from '@/lib/prisma';
import type { CurrencyPairDetail, CurrencyPairSummary } from './dto';

export interface CreateCurrencyPairInput {
  baseCurrency: string;
  quoteCurrency: string;
}

export async function listCurrencyPairs(): Promise<CurrencyPairSummary[]> {
  await requireUser();

  return prisma.forexCurrencyPair.findMany({
    select: { id: true, baseCurrency: true, quoteCurrency: true },
    orderBy: [{ baseCurrency: 'asc' }, { quoteCurrency: 'asc' }],
  });
}

export async function getCurrencyPair(
  id: number,
): Promise<CurrencyPairDetail | null> {
  await requireUser();

  return prisma.forexCurrencyPair.findUnique({
    where: { id },
    select: {
      id: true,
      baseCurrency: true,
      quoteCurrency: true,
      quotes: {
        select: {
          id: true,
          quoteDate: true,
          open: true,
          high: true,
          low: true,
          close: true,
        },
        orderBy: { quoteDate: 'desc' },
      },
    },
  });
}

export async function createCurrencyPair(
  input: CreateCurrencyPairInput,
): Promise<void> {
  await requireUser();

  await prisma.forexCurrencyPair.create({ data: input });
}
