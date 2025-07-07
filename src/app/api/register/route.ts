import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      documentId,
      country,
      birthDate,
      phone
    } = body;

    // 1. Crear usuario en Supabase Auth usando service role key
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });
    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "No se pudo crear el usuario" }, { status: 400 });
    }

    // 2. Enviar magic link (invite) al usuario
    const inviteRes = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_MAGIC_LINK_REDIRECT || 'http://localhost:3000/auth/callback',
    });
    if (inviteRes.error) {
      return NextResponse.json({ error: inviteRes.error.message }, { status: 500 });
    }

    // 3. Insertar en la tabla Profile usando Prisma
    try {
      const profile = await prisma.profile.create({
        data: {
          id: data.user.id,
          email,
          name: firstName,
          lastName,
          documentId,
          country,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone
        }
      });
      return NextResponse.json({ success: true, profile, message: 'Usuario registrado. Revisa tu correo para el magic link.' });
    } catch (prismaError) {
      return NextResponse.json({ error: prismaError instanceof Error ? prismaError.message : prismaError }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : err }, { status: 500 });
  }
}
