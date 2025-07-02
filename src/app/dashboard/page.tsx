import LogoutButton from '@/components/auth/logoutButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Syringe, Users, FileText, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import VaccinesList from '@/components/auth/VaccinesList';
import DashboardVaccinesSection from '@/components/auth/DashboardVaccinesSection';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function DashboardPage() {
  // Obtener usuario logueado y vacunas en el server
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  let vaccines: any[] = [];
  if (user) {
    const prisma = new PrismaClient();
    vaccines = await prisma.vaccine.findMany({
      where: { profileId: user.id },
      orderBy: { vaccinationDate: 'desc' }
    });
  }
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="w-full max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center gap-4">
              <Shield className="h-10 w-10 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold">Bienvenido a tu Dashboard</CardTitle>
                <CardDescription>Administra tus datos y vacunas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 mt-4">
                <div className="flex-1 bg-white/80 rounded-lg p-6 shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Syringe className="w-5 h-5 text-sky-500" /> Mis Vacunas</h2>
                    <Link href="/dashboard/add-vaccine">
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-sm">
                        <Plus className="w-4 h-4" /> Agregar Vacuna
                      </button>
                    </Link>
                  </div>
                  <p className="text-slate-600">Estas son las vacunas que has registrado.</p>
                  <DashboardVaccinesSection vaccines={vaccines} />
                </div>
                <div className="flex-1 bg-white/80 rounded-lg p-6 shadow">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-sky-500" /> Dependientes</h2>
                  <p className="text-slate-600">Administra los datos de tus dependientes.</p>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><FileText className="w-4 h-4" /> Descargar Certificado</button>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}