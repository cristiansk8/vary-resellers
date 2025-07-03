"use client";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserPlus, User, Calendar, CreditCard, Globe, Save, Users as RelationshipIcon, Key } from 'lucide-react';
import { countries } from '@/lib/countries';
import Link from 'next/link';
import BackToDashboardButton from "@/components/ui/BackToDashboardButton";

interface AddDependentFormProps {
  initialData?: any;
  mode?: 'add' | 'edit';
}

export default function AddDependentForm({ initialData, mode = 'add' }: AddDependentFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    relationship: initialData?.relationship || '',
    documentId: initialData?.documentId || '',
    birthDate: initialData?.birthDate
      ? (typeof initialData.birthDate === 'string'
          ? initialData.birthDate.slice(0, 10)
          : (initialData.birthDate instanceof Date
              ? initialData.birthDate.toISOString().slice(0, 10)
              : ''))
      : '',
    country: initialData?.country || '',
  });
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const relationships = [
    t('relationshipSonDaughter'),
    t('relationshipSpouse'),
    t('relationshipParent'),
    t('relationshipSibling'),
    t('relationshipOtherFamily'),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTempPassword('');
    if (!formData.firstName || !formData.lastName || !formData.relationship || !formData.documentId || !formData.birthDate || !formData.country) {
      alert(t('completeAllFieldsToast'));
      setLoading(false);
      return;
    }
    try {
      if (mode === 'edit' && initialData?.id) {
        const res = await fetch(`/api/dependent?id=${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/dashboard/manage-dependents';
        } else {
          alert(data.error || 'Error');
        }
      } else {
        const res = await fetch('/api/dependent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          // Aquí podrías mostrar un toast o feedback visual
          setTempPassword('temporal123'); // Simulación, puedes mostrar info real si la generas
        } else {
          alert(data.error || 'Error');
        }
      }
    } catch (err) {
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="w-full max-w-2xl mx-auto">
          <BackToDashboardButton />
          <Card className="shadow-xl border-slate-200 bg-white rounded-xl">
            <CardHeader className="bg-slate-50 p-5 sm:p-6 rounded-t-xl">
              <CardTitle className="text-xl sm:text-2xl text-blue-800 flex items-center">
                <UserPlus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                {t('dependentData')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><User className="w-4 h-4 mr-2 text-slate-400"/>{t('firstNameLabel')}</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="h-10 sm:h-11 text-sm sm:text-base"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><User className="w-4 h-4 mr-2 text-slate-400"/>{t('lastNameLabel')}</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="h-10 sm:h-11 text-sm sm:text-base"/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="relationship" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><RelationshipIcon className="w-4 h-4 mr-2 text-slate-400"/>{t('relationshipLabel')}</Label>
                  <Select name="relationship" onValueChange={(value) => handleSelectChange('relationship', value)} value={formData.relationship}>
                    <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base"><SelectValue placeholder={t('selectRelationshipPlaceholder')} /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {relationships.map(rel => (
                        <SelectItem key={rel} value={rel} className="text-sm sm:text-base">{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><Globe className="w-4 h-4 mr-2 text-slate-400"/>{t('countryLabel')}</Label>
                    <Select name="country" onValueChange={(value) => handleSelectChange('country', value)} value={formData.country}>
                      <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base"><SelectValue placeholder={t('countryPlaceholder')} /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name} className="text-sm sm:text-base">{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="documentId" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><CreditCard className="w-4 h-4 mr-2 text-slate-400"/>{t('documentIdLabel')}</Label>
                    <Input id="documentId" name="documentId" value={formData.documentId} onChange={handleChange} required className="h-10 sm:h-11 text-sm sm:text-base"/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="text-slate-700 font-medium flex items-center text-sm sm:text-base"><Calendar className="w-4 h-4 mr-2 text-slate-400"/>{t('birthDateLabel')}</Label>
                  <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required className="h-10 sm:h-11 text-sm sm:text-base"/>
                </div>
                {tempPassword && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Key className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold text-sm">{t('dependentAccountCreated')}</p>
                    <p className="text-green-700 text-xs">{t('dependentLoginInfo')}</p>
                    <p className="text-green-700 text-xs mt-1">
                      {t('loginIdentifierLabel')}: <span className="font-bold">{formData.documentId}</span> ({t('orEmail')}: {formData.documentId}@vacun.org)
                    </p>
                    <p className="text-green-700 text-xs">
                      {t('temporaryPasswordLabel')}: <span className="font-bold">{tempPassword}</span>
                    </p>
                  </div>
                )}
                {!tempPassword && (
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 sm:py-3 text-sm sm:text-base h-10 sm:h-11" disabled={loading}>
                    {loading ? t('adding') : (<><UserPlus className="mr-2 h-4 w-4" /> {mode === 'edit' ? t('saveChanges') : t('saveDependent')}</>)}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
