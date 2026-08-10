import { listSectors } from '@/features/pse/data/sectors';
import { paths } from '@/paths';
import { Plus } from '@gravity-ui/icons';
import { Button } from '@heroui/react';
import Link from 'next/link';

export default async function Sectors() {
  const sectors = await listSectors();

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <h1>Sectors</h1>
        <Button isIconOnly variant="ghost">
          <Link href={paths.admin.pse.sectorCreate()}>
            <Plus />
          </Link>
        </Button>
      </div>
      <ul>
        {sectors.map((sector) => (
          <li key={sector.id}>
            <Link href={paths.admin.pse.sector(sector.id)}>{sector.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
