import { prisma } from '@/lib/prisma';

export default async function Sectors() {
  const sectors = await prisma.pseSector.findMany();

  return (
    <div>
      <h1>Sectors</h1>
      <ul>
        {sectors.map((sector) => (
          <li key={sector.id}>{sector.name}</li>
        ))}
      </ul>
    </div>
  );
}
