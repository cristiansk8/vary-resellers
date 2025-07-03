"use client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '@/components/auth/DashboardHeader';
import DashboardWelcomeCard from '@/components/auth/DashboardWelcomeCard';
import DashboardStatsCards from '@/components/auth/DashboardStatsCards';
import DashboardQuickActionsCard from '@/components/auth/DashboardQuickActionsCard';
import DashboardVaccinesSection from '@/components/auth/DashboardVaccinesSection';
import { useEffect, useState } from 'react';

export default function DependentDashboardClientPage({ dependent }: { dependent: any }) {
  const { t } = useTranslation();
  const [vaccines, setVaccines] = useState<any[]>([]);
  useEffect(() => {
    async function fetchVaccines() {
      if (!dependent?.id) return;
      const res = await fetch(`/api/vaccine?dependentId=${dependent.id}`);
      if (res.ok) {
        const data = await res.json();
        setVaccines(data.vaccines || []);
      }
    }
    fetchVaccines();
  }, [dependent]);
  if (!dependent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700">{t('loadingDependentData')}</p>
      </div>
    );
  }
  const userName = `${dependent.firstName} ${dependent.lastName}`;
  const vaccinesCount = vaccines.length;
  return (
    <>
      <DashboardHeader />
      <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="w-full max-w-6xl">
          <DashboardWelcomeCard userName={userName} />
          {/* <DashboardStatsCards vaccinesCount={vaccinesCount} dependentsCount={0} /> */}
          <DashboardQuickActionsCard userName={userName} vaccines={vaccines} profile={dependent} isDependent />
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex-1">
              <DashboardVaccinesSection vaccines={vaccines} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
