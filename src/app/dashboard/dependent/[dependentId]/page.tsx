import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import dynamic from 'next/dynamic';

const DependentDashboardClientPage = dynamic(() => import('./DependentDashboardClientPage'), { ssr: false });

export default async function DependentDashboardPage({ params }: { params: { dependentId: string } }) {
  const { dependentId } = params;
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  let dependent = null;
  if (user && dependentId) {
    const prisma = new PrismaClient();
    dependent = await prisma.dependent.findUnique({
      where: { id: dependentId, mainAccountId: user.id },
    });
  }
  return <DependentDashboardClientPage dependent={dependent} />;
}
