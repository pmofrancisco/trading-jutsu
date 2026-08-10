import 'server-only';

import { requireUser } from '@/features/auth/data/session';
import { prisma } from '@/lib/prisma';
import type { SectorSummary } from './dto';

export interface CreateSectorInput {
  name: string;
}

export async function listSectors(): Promise<SectorSummary[]> {
  await requireUser();

  return prisma.pseSector.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export async function getSector(id: number): Promise<SectorSummary | null> {
  await requireUser();

  return prisma.pseSector.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
}

export async function createSector(input: CreateSectorInput): Promise<void> {
  await requireUser();

  await prisma.pseSector.create({ data: input });
}
