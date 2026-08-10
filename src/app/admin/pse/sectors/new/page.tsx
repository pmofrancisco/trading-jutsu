import { prisma } from '@/lib/prisma';
import { paths } from '@/paths';
import { redirect } from 'next/navigation';

export default function NewSector() {
  async function createSector(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;

    await prisma.pseSector.create({
      data: {
        name,
      },
    });

    redirect(paths.admin.pse.sectorList());
  }

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new PSE Sector</h1>
      <form className="flex flex-col gap-2" action={createSector}>
        <label htmlFor="name">Sector Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="rounded border"
        />
        <button type="submit" className="rounded border">
          Save
        </button>
      </form>
    </div>
  );
}
