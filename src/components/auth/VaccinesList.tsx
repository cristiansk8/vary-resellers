// Este componente solo recibe las vacunas como prop y las muestra
import Link from 'next/link';

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
  if (!vaccines.length) return <div className="mt-8 text-center text-slate-500">No tienes vacunas registradas.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Tus vacunas registradas</h2>
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
                <Link href={`https://fdqdzjviauhracpibtta.supabase.co/storage/v1/object/public/vaccine-proofs/${vac.vaccineProofUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm mt-2 md:mt-0">Ver comprobante</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
