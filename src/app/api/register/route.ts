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

    // 1. Verificar si el usuario ya existe en Supabase
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (existingUser) {
      return NextResponse.json({ 
        error: "Ya existe una cuenta con este email", 
        redirectToLogin: true 
      }, { status: 400 });
    }

    // 2. Verificar si existe en la tabla Profile
    const existingProfile = await prisma.profile.findUnique({
      where: { email }
    });
    
    if (existingProfile) {
      return NextResponse.json({ 
        error: "Ya existe una cuenta con este email", 
        redirectToLogin: true 
      }, { status: 400 });
    }

    // 3. Crear usuario en Supabase Auth usando service role key - SIN confirmación de email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true  // Usuario confirmado automáticamente
    });
    
    if (error) {
      // Manejo específico para errores de duplicación
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint') || error.message.includes('already been registered')) {
        return NextResponse.json({ 
          error: "Ya existe una cuenta con este email", 
          redirectToLogin: true 
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (!data.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 400 });
    }

    // 3. Enviar magic link (invite) al usuario
    const inviteRes = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_MAGIC_LINK_REDIRECT || 'http://localhost:3000/auth/callback',
    });
    if (inviteRes.error) {
      return NextResponse.json({ error: inviteRes.error.message }, { status: 500 });
    }

    // 5. Insertar en la tabla Profile usando Prisma
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
      return NextResponse.json({ 
        success: true, 
        profile, 
        message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.' 
      });
    } catch (prismaError) {
      // Si falla la creación del perfil, eliminar el usuario de Supabase
      await supabase.auth.admin.deleteUser(data.user.id);
      
      const errorMessage = prismaError instanceof Error ? prismaError.message : 'Error desconocido';
      if (errorMessage.includes('Unique constraint')) {
        return NextResponse.json({ error: "Ya existe un perfil con estos datos" }, { status: 400 });
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : err }, { status: 500 });
  }
}
