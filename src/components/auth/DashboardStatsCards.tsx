"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Syringe, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DashboardStatsCards({ vaccinesCount, dependentsCount }: { vaccinesCount: number, dependentsCount: number }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white/90 border-blue-100 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Syringe className="w-10 h-10 text-sky-600 mb-2" />
          <div className="text-3xl font-bold text-blue-900">{vaccinesCount}</div>
          <div className="text-slate-700 text-lg">{t('dashboardVaccinesRegistered')}</div>
        </CardContent>
      </Card>
      <Card className="bg-white/90 border-blue-100 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="w-10 h-10 text-sky-600 mb-2" />
          <div className="text-3xl font-bold text-blue-900">{dependentsCount}</div>
          <div className="text-slate-700 text-lg">{t('dashboardDependentsRegistered')}</div>
        </CardContent>
      </Card>
    </div>
  );
}
