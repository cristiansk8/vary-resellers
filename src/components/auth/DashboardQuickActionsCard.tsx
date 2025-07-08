"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Plus, Users, FileText, Edit, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateCertificatePDF } from '@/lib/pdfGenerator';

export default function DashboardQuickActionsCard({ userName, vaccines, profile, isDependent = false }: { userName: string, vaccines: any[], profile: any, isDependent?: boolean }) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Log para depuración de vacunas
    // eslint-disable-next-line no-console
    console.log('VACUNAS PROP:', vaccines);
    if (Array.isArray(vaccines)) {
      vaccines.forEach((v, i) => {
        // eslint-disable-next-line no-console
        console.log(`Vacuna[${i}]:`, v);
      });
    }
  }, [vaccines]);

  const handleDownloadCertificate = async () => {
    // DEBUG: Mostrar profile y vaccines
    // eslint-disable-next-line no-console
    console.log('PROFILE:', profile);
    // eslint-disable-next-line no-console
    console.log('VACUNAS PROP:', vaccines);
    if (!profile) {
      alert(t('noVaccinesToCertifySelf'));
      return;
    }
    const validVaccines = Array.isArray(vaccines) ? vaccines.filter(v => v && v.vaccineName) : [];
    // eslint-disable-next-line no-console
    console.log('ValidVaccines:', validVaccines);
    if (validVaccines.length === 0) {
      alert(t('noVaccinesToCertifySelf'));
      return;
    }
    const vaccinesForPdf = validVaccines.map(v => ({
      ...v,
      vaccinationDate: v.vaccinationDate instanceof Date ? v.vaccinationDate.toISOString().slice(0, 10) : (typeof v.vaccinationDate === 'string' ? v.vaccinationDate.slice(0, 10) : '')
    }));
    // DEBUG: Mostrar vacunas para PDF
    // eslint-disable-next-line no-console
    console.log('Vacunas para PDF:', vaccinesForPdf);
    await generateCertificatePDF({
      patientName: profile.name || userName,
      documentId: profile.documentId || '',
      birthDate: profile.birthDate || '',
      country: profile.country || '',
      vaccines: vaccinesForPdf,
      issueDate: new Date().toISOString(),
      qrCode: `https://vacun.org/verify/${profile.id}-${Date.now()}`,
      lang: i18n.language,
      t,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-4">
        <Link href={isDependent ? `/dashboard/add-vaccine?profileId=${profile?.id}` : "/dashboard/add-vaccine"}>
          <button className="min-w-[220px] flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-base font-semibold shadow-md">
            <Plus className="w-5 h-5" /> {t('addMyVaccine')}
          </button>
        </Link>
        {!isDependent && (
          <Link href="/dashboard/manage-dependents">
            <button className="min-w-[220px] flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-base font-semibold shadow-md">
              <Users className="w-5 h-5" /> {t('addDependentButton')}
            </button>
          </Link>
        )}
        <Link href="/dashboard/edit-profile">
          <button className="min-w-[220px] flex items-center justify-center gap-2 px-6 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition text-base font-semibold shadow-md">
            <Edit className="w-5 h-5" /> {t('editMyData')}
          </button>
        </Link>
        <button
          className="min-w-[220px] flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-600 text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition text-base font-semibold shadow-md"
          onClick={handleDownloadCertificate}
        >
          <FileText className="w-5 h-5" /> {t('downloadMyCertificate', 'Descargar certificado')}
        </button>
      </CardContent>
      {isDependent && (
        <div className="mt-4 max-w-2xl mx-auto">
          <Link href={`/dashboard/dependent/${profile?.id}/vaccination-scheme`}>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-base font-semibold shadow-md mb-4">
              <Calendar className="w-5 h-5" /> {t('viewVaccinationSchedule', 'Ver esquema de vacunación')}
            </button>
          </Link>
        </div>
      )}
    </Card>
  );
}
