import Header from '@/components/header';
import { requireUser } from '@/features/auth/data/session';

/**
 * Wraps every route that requires a signed-in user. Layouts do not re-render on
 * client-side navigation, so this is not the authorization boundary — it exists
 * to resolve the user for `<Header />` and to keep a signed-out visitor from
 * reaching routes that fetch nothing. `proxy.ts` filters those requests first,
 * and each data function calls `requireUser()` for itself.
 */
export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <>
      <Header user={user} />
      <div className="p-4">{children}</div>
    </>
  );
}
