import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente con Service Role para operaciones admin
const supabaseAdmin = createClient(
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

    // 1. Intentar crear usuario directamente en Supabase Auth
    console.log('Intentando crear usuario con email:', email);
    
    // Usar admin client para crear usuario confirmado automáticamente
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Usuario confirmado automáticamente
      user_metadata: {
        firstName,
        lastName,
        documentId,
        country,
        phone
      }
    });
    
    console.log('Respuesta de Supabase:', { data: data?.user?.id, error: error?.message });
    
    if (error) {
      console.log('Error completo de Supabase:', error);
      // Manejo específico para errores de duplicación
      if (error.message.includes('duplicate key') || 
          error.message.includes('unique constraint') || 
          error.message.includes('already been registered') ||
          error.message.includes('User already registered')) {
        return NextResponse.json({ 
          error: "Ya existe una cuenta con este email", 
          redirectToLogin: true 
        }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Verificar si tenemos un usuario (puede ser nuevo o existente)
    if (!data.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 400 });
    }

    // 2. Verificar si ya existe el perfil en Prisma
    const existingProfile = await prisma.profile.findUnique({
      where: { id: data.user.id }
    });

    if (existingProfile) {
      return NextResponse.json({ 
        error: "Ya existe una cuenta con este email", 
        redirectToLogin: true 
      }, { status: 400 });
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
      return NextResponse.json({ 
        success: true, 
        profile, 
        message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.' 
      });
    } catch (prismaError) {
      // Si falla la creación del perfil, eliminar el usuario de Supabase
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      
      const errorMessage = prismaError instanceof Error ? prismaError.message : 'Error desconocido';
      if (errorMessage.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: "Ya existe una cuenta con este email", 
          redirectToLogin: true 
        }, { status: 400 });
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : err }, { status: 500 });
  }
}
