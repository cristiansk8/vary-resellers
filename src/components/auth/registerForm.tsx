"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { countries } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";
import BackToDashboardButton from "@/components/ui/BackToDashboardButton";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  documentId: string;
  birthDate: string;
  phone: string;
  country: string;
}

interface RegisterFormProps {
  mode?: 'register' | 'edit';
  profile?: Partial<RegisterFormData> & { name?: string };
}

export default function RegisterForm({ mode = 'register', profile }: RegisterFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: profile?.firstName || profile?.name || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    password: '',
    confirmPassword: '',
    documentId: profile?.documentId || '',
    birthDate: profile?.birthDate
      ? (typeof profile.birthDate === 'string'
          ? profile.birthDate.slice(0, 10)
          : (typeof profile.birthDate === 'object' && profile.birthDate !== null && 'toISOString' in profile.birthDate
              ? (profile.birthDate as Date).toISOString().slice(0, 10)
              : ''))
      : '',
    phone: profile?.phone || '',
    country: profile?.country || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, country: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (mode === 'edit') {
      // Actualizar perfil existente
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, birthDate: formData.birthDate || null })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error al actualizar el perfil');
        } else {
          setSuccess('Perfil actualizado correctamente.');
        }
      } catch (err) {
        setError('Error inesperado al actualizar el perfil');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }
    if (!formData.country) {
      setError("El país es obligatorio");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, birthDate: formData.birthDate || null })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error en el registro");
      } else {
        setSuccess("Registro exitoso. Ya puedes iniciar sesión.");
        // Redirigir después de unos segundos
        setTimeout(() => router.push("/sign-in"), 2000);
      }
    } catch (err) {
      setError("Error inesperado en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      {mode === 'edit' && <BackToDashboardButton />}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-2xl">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="flex justify-center items-center mb-4">
              <Shield className="h-12 w-12 text-blue-600 mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">{mode === 'edit' ? t('userProfileTitle', 'Editar Perfil') : t('registerTitle', 'Registro')}</CardTitle>
            <CardDescription>{mode === 'edit' ? t('userProfileSubtitle', 'Actualice su información personal y de contacto.') : t('registerDescription', 'Completa el formulario para crear tu cuenta')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="firstName">{t('firstNameLabel', 'Nombre')}</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="lastName">{t('lastNameLabel', 'Apellido')}</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="email">{t('emailLabel', 'Email')}</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="documentId">{t('documentIdLabel', 'Documento')}</Label>
                  <Input id="documentId" name="documentId" value={formData.documentId} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="birthDate">{t('birthDateLabel', 'Fecha de nacimiento')}</Label>
                  <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="phone">{t('phoneLabel', 'Teléfono')}</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="country">{t('countryLabel', 'País')}</Label>
                <Select value={formData.country} onValueChange={handleSelectChange}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t('countryPlaceholder', 'Selecciona un país')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {mode !== 'edit' && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <Label htmlFor="password">{t('passwordLabel', 'Contraseña')}</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="confirmPassword">{t('confirmPasswordLabel', 'Confirmar contraseña')}</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              )}
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (mode === 'edit' ? t('updatingProfile', 'Actualizando...') : t('registering', 'Registrando...')) : (mode === 'edit' ? t('updateProfileButton', 'Actualizar') : t('registerButton', 'Registrarse'))}
              </Button>
            </form>
            {mode !== 'edit' && (
              <div className="mt-4 text-center">
                <span>{t('alreadyHaveAccount', '¿Ya tienes cuenta?')} </span>
                <Link href="/sign-in" className="text-blue-600 hover:underline">{t('signInLink', 'Inicia sesión')}</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
