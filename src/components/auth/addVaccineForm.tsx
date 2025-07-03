"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTranslation } from "react-i18next";
import { countries } from "@/lib/countries";
import { getVaccineListForCountry } from "@/lib/vaccinationSchedules";
import Header from "@/components/Header";
import BackToDashboardButton from "@/components/ui/BackToDashboardButton";

const dosesList = [
  '1ra Dosis', '2da Dosis', '3ra Dosis', 'Refuerzo', 'Dosis Única', 'Refuerzo Anual'
];

interface AddVaccineFormProps {
  profileId?: string;
  dependentId?: string;
  country?: string;
  initialData?: any;
  mode?: 'add' | 'edit';
  onSuccess?: () => void;
}

export default function AddVaccineForm({ profileId, dependentId, country = 'DEFAULT', initialData, mode = 'add', onSuccess }: AddVaccineFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState({
    vaccineName: initialData?.vaccineName || '',
    dose: initialData?.dose || '',
    vaccinationDate: initialData?.vaccinationDate
      ? (typeof initialData.vaccinationDate === 'string'
          ? initialData.vaccinationDate.slice(0, 10)
          : (initialData.vaccinationDate instanceof Date
              ? initialData.vaccinationDate.toISOString().slice(0, 10)
              : ''))
      : '',
    vaccinationPlace: initialData?.vaccinationPlace || '',
    healthProfessional: initialData?.healthProfessional || '',
    vaccineLot: initialData?.vaccineLot || '',
    vaccineProofUrl: initialData?.vaccineProofUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [vaccineProof, setVaccineProof] = useState<File | null>(null);
  const [vaccineProofName, setVaccineProofName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVaccineProof(file);
      setVaccineProofName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    let vaccineProofUrl = formData.vaccineProofUrl || "";
    if (vaccineProof) {
      // Subir archivo a Supabase Storage
      const supabaseStorage = createClientComponentClient();
      const filePath = `${profileId}/${Date.now()}_${vaccineProof.name}`;
      console.log('DEBUG UID:', profileId);
      console.log('DEBUG PATH:', filePath);
      const { data, error: uploadError } = await supabaseStorage.storage.from("vaccine-proofs").upload(filePath, vaccineProof);
      if (uploadError) {
        setError(uploadError.message || "Error al subir el comprobante");
        setLoading(false);
        return;
      }
      vaccineProofUrl = data?.path ? data.path : "";
    }
    const payload = {
      ...formData,
      vaccineProofUrl,
      ...(dependentId ? { dependentId } : { profileId })
    };
    if (mode === 'edit' && initialData?.id) {
      // Actualizar vacuna existente
      const res = await fetch(`/api/vaccine?id=${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Vacuna actualizada correctamente.");
        if (onSuccess) onSuccess();
        router.push("/dashboard");
      } else {
        setError(data.error || "Error al actualizar vacuna");
      }
      setLoading(false);
      return;
    }
    // Aquí deberías llamar a una API route que inserte la vacuna usando Prisma
    const res = await fetch("/api/vaccine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('DEBUG API RESPONSE:', data);
    if (res.ok) {
      setSuccess("Vacuna agregada correctamente.");
      if (dependentId) {
        router.push(`/dashboard/dependent/${dependentId}`);
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(data.error || "Error al agregar vacuna");
    }
    setLoading(false);
  };

  // TODO: Obtener el código de país real del usuario, por ahora se usa 'DEFAULT'
  const vaccineList = getVaccineListForCountry(country);

  return (
    <>
      <Header />
      <div className="flex justify-end max-w-xl mx-auto mt-4">
        <BackToDashboardButton />
      </div>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-xl mx-auto">
          <CardHeader className="text-center pt-8 pb-6">
            <CardTitle className="text-2xl font-bold mb-2">{mode === 'edit' ? t('editVaccineTitle', 'Editar vacuna') : t('addVaccineTitle', 'Agregar vacuna')}</CardTitle>
            <CardDescription>{mode === 'edit' ? t('editVaccineDescription', 'Edita los datos de la vacuna seleccionada') : t('addVaccineDescription', 'Registra una nueva vacuna en tu historial')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>{t('vaccineNameLabel', 'Nombre de la vacuna')}</Label>
                <Select name="vaccineName" value={formData.vaccineName} onValueChange={value => handleSelectChange('vaccineName', value)} required>
                  <SelectTrigger><SelectValue placeholder={t('selectVaccinePlaceholder', 'Selecciona vacuna')} /></SelectTrigger>
                  <SelectContent>
                    {vaccineList.map(vac => (
                      <SelectItem key={vac} value={vac}>{vac}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('doseLabel', 'Dosis')}</Label>
                <Select name="dose" value={formData.dose} onValueChange={value => handleSelectChange('dose', value)} required>
                  <SelectTrigger><SelectValue placeholder={t('selectDosePlaceholder', 'Selecciona dosis')} /></SelectTrigger>
                  <SelectContent>
                    {dosesList.map(dose => (
                      <SelectItem key={dose} value={dose}>{t(dose)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('vaccinationDateLabel', 'Fecha de vacunación')}</Label>
                <Input name="vaccinationDate" type="date" value={formData.vaccinationDate} onChange={handleChange} required />
              </div>
              <div>
                <Label>{t('vaccinationPlaceLabel', 'Lugar de vacunación')}</Label>
                <Input name="vaccinationPlace" value={formData.vaccinationPlace} onChange={handleChange} required />
              </div>
              <div>
                <Label>{t('healthProfessionalLabel', 'Profesional de salud')}</Label>
                <Input name="healthProfessional" value={formData.healthProfessional} onChange={handleChange} required />
              </div>
              <div>
                <Label>{t('vaccineLotLabel', 'Lote de la vacuna')}</Label>
                <Input name="vaccineLot" value={formData.vaccineLot} onChange={handleChange} />
              </div>
              <div>
                <Label>{t('vaccineProofLabel', 'Comprobante de vacuna (opcional)')}</Label>
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                {vaccineProofName && <span className="text-sm text-blue-700 truncate max-w-xs">{vaccineProofName}</span>}
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (mode === 'edit' ? t('updatingVaccine', 'Actualizando...') : t('addingVaccine', 'Agregando...')) : (mode === 'edit' ? t('updateVaccineButton', 'Actualizar vacuna') : t('addVaccineButton', 'Agregar vacuna'))}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
