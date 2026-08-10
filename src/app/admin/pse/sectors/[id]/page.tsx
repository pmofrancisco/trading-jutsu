import { getSector } from '@/features/pse/data/sectors';
import { notFound } from 'next/navigation';

interface SectorProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Sector(props: SectorProps) {
  const { id } = await props.params;
  const sectorId = Number(id);

  if (!Number.isInteger(sectorId)) {
    notFound();
  }

  const sector = await getSector(sectorId);

  if (!sector) {
    notFound();
  }

  return (
    <div>
      <h1>{sector.name}</h1>
    </div>
  );
}
