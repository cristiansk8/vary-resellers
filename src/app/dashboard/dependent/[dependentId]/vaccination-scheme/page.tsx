"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, User as UserIcon, CheckCircle, Circle, Calendar, HelpCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '@/components/auth/DashboardHeader';

interface VaccineScheme {
  id: string;
  name: string;
  age: string;
  keywords: string[];
  completed: boolean;
}

export default function VaccinationSchemePage() {
  const { t } = useTranslation();
  const { dependentId } = useParams();
  const router = useRouter();

  const [dependent, setDependent] = useState<any>(null);
  const [scheme, setScheme] = useState<VaccineScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVaccinationScheme() {
      if (!dependentId) return;
      
      try {
        console.log('🔍 Fetching scheme for dependent ID:', dependentId);
        const response = await fetch(`/api/vaccination-scheme/${dependentId}`);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        setDependent(data.dependent);
        setScheme(data.scheme);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : t('vaccinationScheduleError');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchVaccinationScheme();
  }, [dependentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700">{t('vaccinationScheduleLoading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>{t('vaccinationScheduleBackToProfile')}</Button>
        </div>
      </div>
    );
  }

  if (!dependent) return null;

  const completedCount = scheme.filter(v => v.completed).length;
  const totalCount = scheme.length;

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-10 w-10 text-blue-700" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
                    {t('vaccinationScheduleTitle', { name: `${dependent.firstName} ${dependent.lastName}` })}
                  </h1>
                  <p className="text-lg text-slate-600">
                    {t('vaccinationScheduleSubtitle', { country: dependent.country })}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('vaccinationScheduleBackToProfile')}
              </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{t('vaccinationScheduleCompleted')}</p>
                      <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{t('vaccinationSchedulePending')}</p>
                      <p className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</p>
                    </div>
                    <Circle className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{t('vaccinationScheduleProgress', { completed: completedCount, total: totalCount })}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-8 h-8 relative">
                      <div className="w-full h-full bg-slate-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-start space-x-4">
                <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  {t('vaccinationScheduleNoSchedule', { country: dependent.country })}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-slate-200">
              <CardHeader className="bg-slate-50 p-6 rounded-t-lg">
                <CardTitle className="text-2xl text-blue-800">{t('vaccinationScheduleViewAll')}</CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  {t('vaccinationScheduleVaccinesInAge')} {dependent.firstName}.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {scheme.length > 0 ? scheme.map((vaccine) => (
                    <div key={vaccine.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        {vaccine.completed ? (
                          <CheckCircle className="h-7 w-7 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-7 w-7 text-slate-300 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 text-base">{vaccine.name}</p>
                          <p className="text-sm text-slate-500 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {t('vaccinationScheduleAgeRange', { ageRange: vaccine.age })}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                        vaccine.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {vaccine.completed ? t('vaccinationScheduleCompleted') : t('vaccinationSchedulePending')}
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-slate-500">
                      <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      {t('vaccinationScheduleNoSchedule', { country: dependent.country })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
