import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface SectorProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Sector(props: SectorProps) {
  const { id } = await props.params;

  const sector = await prisma.pseSector.findFirst({
    where: {
      id: parseInt(id),
    },
  });

  if (!sector) {
    notFound();
  }

  return (
    <div>
      <h1>{sector.name}</h1>
    </div>
  );
}
