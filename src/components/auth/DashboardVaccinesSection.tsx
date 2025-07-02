"use client";
import { Syringe, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import VaccinesList from '@/components/auth/VaccinesList';

export default function DashboardVaccinesSection({ vaccines }: { vaccines: any[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 bg-white/80 rounded-lg p-6 shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Syringe className="w-5 h-5 text-sky-500" /> {t('myVaccines')}</h2>
        <Link href="/dashboard/add-vaccine">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-sm">
            <Plus className="w-4 h-4" /> {t('addMyVaccine')}
          </button>
        </Link>
      </div>
      <p className="text-slate-600">{t('myRegisteredVaccinesDesc')}</p>
      <VaccinesList vaccines={vaccines} />
    </div>
  );
}
