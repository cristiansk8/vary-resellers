"use client";

import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function LoginForm() {
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
    const { loginIdentifier, password } = formData;
    const { error } = await supabase.auth.signInWithPassword({
      email: loginIdentifier,
      password
    });
    if (error) {
      setError("Credenciales incorrectas o usuario no existe");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
      <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-md">
        <CardHeader className="text-center pt-8 pb-6">
          <div className="flex justify-center items-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu cuenta con tu correo y contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="loginIdentifier">Correo electrónico</Label>
              <Input id="loginIdentifier" name="loginIdentifier" type="email" value={formData.loginIdentifier} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span>¿No tienes cuenta? </span>
            <Link href="/sign-up" className="text-blue-600 hover:underline">Regístrate</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
