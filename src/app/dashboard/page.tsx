import LogoutButton from '@/components/auth/logoutButton';
import { Shield, Syringe, Users, FileText, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardHeader from '@/components/auth/DashboardHeader';
import DashboardWelcomeCard from '@/components/auth/DashboardWelcomeCard';
import DashboardStatsCards from '@/components/auth/DashboardStatsCards';
import DashboardQuickActionsCard from '@/components/auth/DashboardQuickActionsCard';
import DashboardVaccinesSection from '@/components/auth/DashboardVaccinesSection';

export default async function DashboardPage() {
  // Obtener usuario logueado y vacunas en el server
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  let vaccines: any[] = [];
  let userName = '';
  let vaccinesCount = 0;
  let dependentsCount = 0;
  let profile = null;
  if (user) {
    const prisma = new PrismaClient();
    vaccines = await prisma.vaccine.findMany({
      where: { profileId: user.id },
      orderBy: { vaccinationDate: 'desc' }
    });
    vaccinesCount = vaccines.length;
    profile = await prisma.profile.findUnique({ where: { id: user.id } });
    userName = profile?.name ? profile.name : (user.email || '');
    dependentsCount = await prisma.dependent.count({ where: { mainAccountId: user.id } });
  }
  return (
    <>
      <DashboardHeader />
      <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="w-full max-w-6xl">
          <DashboardWelcomeCard userName={userName} />
          <DashboardStatsCards vaccinesCount={vaccinesCount} dependentsCount={dependentsCount} />
          <DashboardQuickActionsCard userName={userName} vaccines={vaccines} profile={profile} />
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex-1">
              <DashboardVaccinesSection vaccines={vaccines} />
            </div>
            {/* Dependientes removido para vista full pantalla de vacunas */}
          </div>
          {/* <div className="flex gap-4 mt-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><FileText className="w-4 h-4" /> Descargar Certificado</button>
          </div> */}
        </div>
      </main>
    </>
  );
}