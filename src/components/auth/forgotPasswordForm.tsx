"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
    } else {
      setMessage("Revisa tu correo para restablecer la contraseña.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
      <Card className="shadow-xl border-slate-200 bg-white/80 backdrop-blur-md rounded-xl w-full max-w-md">
        <CardHeader className="text-center pt-8 pb-6">
          <CardTitle className="text-2xl font-bold mb-2">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>Ingresa tu correo y te enviaremos instrucciones para restablecerla.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/sign-in" className="text-blue-600 hover:underline">Volver a iniciar sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
