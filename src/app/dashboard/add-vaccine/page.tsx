import AddVaccineForm from '@/components/auth/addVaccineForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { PrismaClient } from '@prisma/client';

export default async function AddVaccinePage({ searchParams }: { searchParams: { profileId?: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;
  const prisma = new PrismaClient();
  let profileId = user.id;
  let dependentId = undefined;
  let country = 'DEFAULT';
  if (searchParams.profileId) {
    const dependent = await prisma.dependent.findUnique({ where: { id: searchParams.profileId } });
    if (dependent) {
      dependentId = dependent.id;
      country = dependent.country || 'DEFAULT';
    }
  } else {
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    country = profile?.country || 'DEFAULT';
  }
  return <AddVaccineForm profileId={profileId} dependentId={dependentId} country={country} />;
}
