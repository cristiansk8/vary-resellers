import AddDependentForm from '@/components/auth/AddDependentForm';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { PrismaClient } from '@prisma/client';

export default async function EditDependentPage({ searchParams }: { searchParams: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;
  const prisma = new PrismaClient();
  const dependent = await prisma.dependent.findUnique({ where: { id: searchParams.id } });
  if (!dependent) return <div>Dependiente no encontrado</div>;
  return <AddDependentForm initialData={dependent} mode="edit" />;
}
