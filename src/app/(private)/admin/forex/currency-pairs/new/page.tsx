import { requireUser } from '@/features/auth/data/session';
import CurrencyPairForm from '@/features/forex/ui/currency-pair-form';

export default async function NewCurrencyPair() {
  await requireUser();

  return (
    <div className="p-2">
      <h1 className="font-bold mb-2">Create a new Forex Currency Pair</h1>
      <CurrencyPairForm />
    </div>
  );
}
