"use client";
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/store/ui/userContext';

export default function DashboardWelcomeCard({ userName }: { userName: string }) {
  const { t } = useTranslation();
  const { setUserName } = useUserContext();

  useEffect(() => {
    if (userName) setUserName(userName);
  }, [userName, setUserName]);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center gap-4">
        <Shield className="h-10 w-10 text-blue-600" />
        <div>
          <CardTitle className="text-2xl font-bold">{t('dashboardWelcome', { name: userName })}</CardTitle>
          <CardDescription>{t('dashboardManage')}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
