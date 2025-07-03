"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DependentsList({ dependents }: { dependents: any[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteDependent', '¿Seguro que deseas eliminar este dependiente?'))) return;
    const res = await fetch(`/api/dependent?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert(t('errorDeletingDependent', 'Error al eliminar el dependiente'));
    }
  };
  if (!dependents.length) {
    return (
      <div className="bg-white/80 rounded-lg p-4 shadow text-center text-slate-500">
        {t('noDependentsRegistered')}
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {dependents.map((dep) => (
        <Card key={dep.id} className="border-blue-100 shadow-md">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg font-bold">{dep.firstName} {dep.lastName}</CardTitle>
              <CardDescription>{t('relationshipLabel')}: {dep.relationship}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-slate-700 text-sm mb-1">{t('documentIdLabel')}: <span className="font-mono">{dep.documentId}</span></div>
            <div className="text-slate-700 text-sm mb-1">{t('countryLabel')}: {dep.country}</div>
            <div className="text-slate-700 text-sm mb-1">{t('birthDateLabel')}: {new Date(dep.birthDate).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-2">
              <Link href={`/dashboard/dependent/${dep.id}`} className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
                {t('viewProfile')}
              </Link>
              <button className="flex items-center gap-1 text-blue-600 underline text-sm" onClick={() => router.push(`/dashboard/edit-dependent?id=${dep.id}`)}>
                <Edit className="w-4 h-4" /> {t('edit', 'Editar')}
              </button>
              <button className="flex items-center gap-1 text-red-600 underline text-sm" onClick={() => handleDelete(dep.id)}>
                <Trash2 className="w-4 h-4" /> {t('delete', 'Eliminar')}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
