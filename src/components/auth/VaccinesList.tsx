// Este componente solo recibe las vacunas como prop y las muestra
import Link from 'next/link';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { t } from 'i18next';
import { useRouter } from 'next/navigation';

interface Vaccine {
  id: string;
  vaccineName: string;
  dose: string;
  vaccinationDate: string;
  vaccinationPlace: string;
  healthProfessional: string;
  vaccineLot?: string;
  vaccineProofUrl?: string;
}

export default function VaccinesList({ vaccines }: { vaccines: Vaccine[] }) {
  const router = useRouter();
  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta vacuna?')) return;
    const res = await fetch(`/api/vaccine?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Error al eliminar la vacuna');
    }
  };

  if (!vaccines.length) return (
    <div className="mt-8 text-center text-slate-500 flex flex-col items-center gap-4">
      <div>{t('noVaccinesRegistered', 'No tienes vacunas registradas.')}</div>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-base font-semibold"
        onClick={() => router.push('/dashboard/add-vaccine')}
      >
        <FileText className="w-5 h-5" /> {t('addMyVaccine', 'Agregar vacuna')}
      </button>
    </div>
  );

  return (
    <div className="mt-8">
      {/* <h2 className="text-xl font-bold mb-4">Tus vacunas registradas</h2> */}
      <div className="grid gap-4">
        {vaccines.map(vac => (
          <div key={vac.id} className="border rounded-lg p-4 bg-white/80 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold text-blue-900">{vac.vaccineName} ({vac.dose})</div>
                <div className="text-slate-700 text-sm">{new Date(vac.vaccinationDate).toLocaleDateString()}</div>
                <div className="text-slate-600 text-sm">Lugar: {vac.vaccinationPlace}</div>
                <div className="text-slate-600 text-sm">Profesional: {vac.healthProfessional}</div>
                {vac.vaccineLot && <div className="text-slate-600 text-sm">Lote: {vac.vaccineLot}</div>}
              </div>
              {vac.vaccineProofUrl && (
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Link href={`https://fdqdzjviauhracpibtta.supabase.co/storage/v1/object/public/vaccine-proofs/${vac.vaccineProofUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 underline text-sm">
                    <FileText className="w-4 h-4" /> {t('proof', 'Prueba')}
                  </Link>
                  <button className="flex items-center gap-1 text-blue-600 underline text-sm" onClick={() => router.push(`/dashboard/edit-vaccine?id=${vac.id}`)}>
                    <Edit className="w-4 h-4" /> {t('edit', 'Editar')}
                  </button>
                  <button className="flex items-center gap-1 text-red-600 underline text-sm" onClick={() => handleDelete(vac.id)}>
                    <Trash2 className="w-4 h-4" /> {t('delete', 'Eliminar')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
