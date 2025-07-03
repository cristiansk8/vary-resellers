import dynamic from 'next/dynamic';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const ManageDependentsClientPage = dynamic(
  () => import('./ManageDependentsClientPage'),
  { ssr: false }
);

export default async function ManageDependentsPage() {
  // Obtener usuario autenticado
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  let dependents: any[] = [];
  if (user) {
    const prisma = new PrismaClient();
    dependents = await prisma.dependent.findMany({
      where: { mainAccountId: user.id },
      orderBy: { createdAt: 'desc' }
    });
  }
  return <ManageDependentsClientPage dependents={dependents} />;
}
