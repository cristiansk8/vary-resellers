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

const dosesList = [
  '1ra Dosis', '2da Dosis', '3ra Dosis', 'Refuerzo', 'Dosis Única', 'Refuerzo Anual'
];

export default function AddVaccineForm({ profileId }: { profileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState({
    vaccineName: '',
    dose: '',
    vaccinationDate: '',
    vaccinationPlace: '',
    healthProfessional: '',
    vaccineLot: '',
    vaccineProofUrl: ''
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
    let vaccineProofUrl = "";
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
    // Aquí deberías llamar a una API route que inserte la vacuna usando Prisma
    const res = await fetch("/api/vaccine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, profileId, vaccineProofUrl })
    });
    const data = await res.json();
    console.log('DEBUG API RESPONSE:', data);
    if (res.ok) {
      setSuccess("Vacuna agregada correctamente.");
      router.push("/dashboard");
    } else {
      setError(data.error || "Error al agregar vacuna");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
      <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-xl">
        <CardHeader className="text-center pt-8 pb-6">
          <CardTitle className="text-2xl font-bold mb-2">Agregar vacuna</CardTitle>
          <CardDescription>Registra una nueva vacuna en tu historial</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Nombre de la vacuna</Label>
              <Input name="vaccineName" value={formData.vaccineName} onChange={handleChange} required />
            </div>
            <div>
              <Label>Dosis</Label>
              <Select name="dose" value={formData.dose} onValueChange={value => handleSelectChange('dose', value)} required>
                <SelectTrigger><SelectValue placeholder="Selecciona dosis" /></SelectTrigger>
                <SelectContent>
                  {dosesList.map(dose => (
                    <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de vacunación</Label>
              <Input name="vaccinationDate" type="date" value={formData.vaccinationDate} onChange={handleChange} required />
            </div>
            <div>
              <Label>Lugar de vacunación</Label>
              <Input name="vaccinationPlace" value={formData.vaccinationPlace} onChange={handleChange} required />
            </div>
            <div>
              <Label>Profesional de salud</Label>
              <Input name="healthProfessional" value={formData.healthProfessional} onChange={handleChange} required />
            </div>
            <div>
              <Label>Lote de la vacuna</Label>
              <Input name="vaccineLot" value={formData.vaccineLot} onChange={handleChange} />
            </div>
            <div>
              <Label>Comprobante de vacuna (opcional)</Label>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
              {vaccineProofName && <span className="text-sm text-blue-700 truncate max-w-xs">{vaccineProofName}</span>}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Agregando..." : "Agregar vacuna"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
