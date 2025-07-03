"use client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Link from 'next/link';
import DashboardHeader from '@/components/auth/DashboardHeader';
import DependentsList from '@/components/auth/DependentsList';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import BackToDashboardButton from '@/components/ui/BackToDashboardButton';

export default function ManageDependentsClientPage({ dependents }: { dependents: any[] }) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <DashboardHeader />
      <div className="w-full max-w-[98vw]">
        <div className="flex justify-end mb-2">
          <BackToDashboardButton />
        </div>
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-blue-600" />
              <CardTitle>{t('manageDependentsTitle')}</CardTitle>
            </div>
            <Link href="/dashboard/add-dependent">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-base font-semibold"
              >
                <span className="hidden sm:inline">{t('addDependentButton')}</span>
                <span className="sm:hidden">+</span>
              </button>
            </Link>
          </CardHeader>
          <CardContent>
            <DependentsList dependents={dependents} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
