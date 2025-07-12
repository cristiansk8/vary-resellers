import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API CON SQL DIRECTO - Sin errores de Prisma');
    
    const body = await request.json();
    console.log('📦 Datos recibidos:', body);

    const { firstName, lastName, email, relationship, documentId, birthDate, country } = body;

    if (!firstName || !lastName || !email || !relationship || !documentId || !birthDate || !country) {
      return NextResponse.json({
        success: false,
        error: 'Todos los campos son requeridos'
      }, { status: 400 });
    }

    // Verificar duplicados con SQL
    console.log('🔍 Verificando duplicados...');
    const existing = await prisma.$queryRaw`
      SELECT id FROM "public"."Dependent" 
      WHERE email = ${email} OR "documentId" = ${documentId}
      LIMIT 1
    ` as Array<{id: string}>;

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Ya existe un dependiente con ese email o documento'
      }, { status: 400 });
    }

    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    console.log('🔑 Contraseña generada:', tempPassword);

    // PASO 1: Crear usuario en Supabase Auth
    console.log('🔐 Creando usuario en Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        role: 'dependent',
        documentId
      }
    });

    if (authError) {
      console.error('❌ Error en Auth:', authError);
      return NextResponse.json({
        success: false,
        error: `Error de autenticación: ${authError.message}`
      }, { status: 400 });
    }

    console.log('✅ Usuario Auth creado:', authUser.user.id);

    // PASO 2: Insertar perfil con SQL directo
    console.log('👤 Insertando perfil...');
    await prisma.$executeRaw`
      INSERT INTO "public"."Profile" (
        "id", "email", "name", "lastName", "documentId", 
        "role", "country", "birthDate", "createdAt", "updatedAt"
      ) VALUES (
        ${authUser.user.id}::uuid,
        ${email},
        ${firstName},
        ${lastName},
        ${documentId},
        'dependent',
        ${country},
        ${new Date(birthDate)},
        NOW(),
        NOW()
      )
    `;

    console.log('✅ Perfil insertado');

    // PASO 3: Buscar usuario principal para mainAccountId
    console.log('🔍 Buscando usuario principal...');
    const mainUsers = await prisma.$queryRaw`
      SELECT id FROM "public"."Profile" 
      WHERE role = 'user' 
      LIMIT 1
    ` as Array<{id: string}>;

    const mainAccountId = mainUsers.length > 0 ? mainUsers[0].id : authUser.user.id;
    console.log('🔗 MainAccountId encontrado:', mainAccountId);

    // PASO 4: Insertar dependiente con SQL directo
    console.log('👥 Insertando dependiente...');
    const dependentId = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO "public"."Dependent" (
        "id", "firstName", "lastName", "email", "relationship", 
        "documentId", "birthDate", "country", "mainAccountId", 
        "createdAt", "updatedAt"
      ) VALUES (
        ${dependentId}::uuid,
        ${firstName},
        ${lastName},
        ${email},
        ${relationship},
        ${documentId},
        ${new Date(birthDate)},
        ${country},
        ${mainAccountId}::uuid,
        NOW(),
        NOW()
      )
    `;

    console.log('✅ Dependiente insertado exitosamente:', dependentId);

    return NextResponse.json({
      success: true,
      message: 'REAL - Dependiente creado exitosamente en Supabase',
      loginInfo: {
        email: email,
        documentId: documentId,
        tempPassword: tempPassword
      },
      ids: {
        profileId: authUser.user.id,
        dependentId: dependentId
      }
    });

  } catch (error: any) {
    console.error('💥 Error completo:', error);
    return NextResponse.json({
      success: false,
      error: `Error: ${error.message}`
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API funcionando con SQL directo',
    timestamp: new Date().toISOString()
  });
}