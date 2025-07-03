import AddVaccineForm from '@/components/auth/addVaccineForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { PrismaClient } from '@prisma/client';

export default async function EditVaccinePage({ searchParams }: { searchParams: { id: string } }) {
  // Obtener el usuario autenticado para pasar el profileId al formulario
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;
  const prisma = new PrismaClient();
  // Obtener la vacuna a editar
  const vaccine = await prisma.vaccine.findUnique({ where: { id: searchParams.id } });
  if (!vaccine) return <div>Vacuna no encontrada</div>;
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const country = profile?.country || 'DEFAULT';
  return <AddVaccineForm profileId={user.id} country={country} initialData={vaccine} mode="edit" />;
}
