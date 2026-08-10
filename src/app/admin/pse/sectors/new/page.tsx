import { requireUser } from '@/features/auth/data/session';
import SectorForm from '@/features/pse/ui/sector-form';

export default async function NewSector() {
  await requireUser();

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new PSE Sector</h1>
      <SectorForm />
    </div>
  );
}
