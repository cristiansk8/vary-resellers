import RegisterForm from '@/components/auth/registerForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { PrismaClient } from '@prisma/client';

export default async function EditProfilePage() {
  // Obtener usuario autenticado
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;
  // Obtener datos actuales del perfil
  const prisma = new PrismaClient();
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const safeProfile = profile
    ? Object.fromEntries(
        Object.entries(profile).map(([k, v]) => [k, v === null ? undefined : v])
      )
    : undefined;
  return <RegisterForm mode="edit" profile={safeProfile} />;
}
