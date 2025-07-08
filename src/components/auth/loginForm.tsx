"use client";

import { useState } from "react";
import { Shield, Mail, Lock, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Footer from "@/components/footer";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    loginIdentifier: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { loginIdentifier, password } = formData;
      
      // Usar nuestro endpoint personalizado que maneja email y documento
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginIdentifier,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || t('loginErrorDesc'));
        setLoading(false);
        return;
      }

      // Login exitoso, redirigir al dashboard
      router.push("/dashboard");
      router.refresh();
      
    } catch (err) {
      console.error('Login error:', err);
      setError(t('unexpectedErrorDesc'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
      <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-md">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="flex justify-center items-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="loginIdentifier" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t('emailOrDocumentLabel')}
              </Label>
              <Input 
                id="loginIdentifier" 
                name="loginIdentifier" 
                type="text" 
                placeholder={t('emailOrDocumentPlaceholder')}
                value={formData.loginIdentifier} 
                onChange={handleChange} 
                required 
              />
              <p className="text-xs text-slate-500 mt-1">
                {t('orEmail')} {t('documentIdLabel').toLowerCase()}
              </p>
            </div>
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t('passwordLabel')}
              </Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder={t('passwordPlaceholder')}
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? t('loggingIn') : t('login')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span>{t('noAccount')} </span>
            <Link href="/sign-up" className="text-blue-600 hover:underline">
              {t('registerHere')}
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              ¿{t('forgotPassword')}?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
