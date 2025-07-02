import AddVaccineForm from '@/components/auth/addVaccineForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function AddVaccinePage() {
  // Obtener el usuario autenticado para pasar el profileId al formulario
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  // Si no hay usuario, podrías redirigir o mostrar error
  if (!user) return <div>No autorizado</div>;
  return <AddVaccineForm profileId={user.id} />;
}
