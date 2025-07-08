import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cliente con Service Role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para generar una contraseña temporal
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST - Crear nuevo dependiente
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación del usuario principal
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { firstName, lastName, relationship, documentId, birthDate, country } = await request.json();

    // Validar datos requeridos
    if (!firstName || !lastName || !relationship || !documentId || !birthDate || !country) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que el documento no esté ya registrado
    const existingDependent = await prisma.dependent.findUnique({
      where: { documentId }
    });

    if (existingDependent) {
      return NextResponse.json(
        { error: 'Ya existe un dependiente con este número de documento' },
        { status: 400 }
      );
    }

    // Verificar que el usuario principal existe en la tabla Profile
    const mainProfile = await prisma.profile.findUnique({
      where: { id: user.id }
    });

    if (!mainProfile) {
      return NextResponse.json(
        { error: 'Perfil del usuario principal no encontrado' },
        { status: 404 }
      );
    }

    // Generar contraseña temporal para el dependiente
    const tempPassword = generateTempPassword();
    
    // Crear email temporal para el dependiente (usando documentId)
    const dependentEmail = `dependent-${documentId}@vacun.org`;

    // Crear cuenta de Supabase para el dependiente
    let supabaseUser = null;
    try {
      // Crear cliente con permisos de admin usando service role key
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: dependentEmail,
        password: tempPassword,
        email_confirm: true, // Auto-confirmar el email
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          document_id: documentId,
          is_dependent: true,
          main_account_id: user.id
        }
      });

      if (signUpError) {
        console.error('Error creando usuario Supabase:', signUpError);
        return NextResponse.json(
          { error: 'Error creando cuenta de usuario para el dependiente' },
          { status: 500 }
        );
      }

      supabaseUser = signUpData.user;
    } catch (supabaseError) {
      console.error('Error con Supabase Admin:', supabaseError);
      return NextResponse.json(
        { error: 'Error del servicio de autenticación' },
        { status: 500 }
      );
    }

    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'No se pudo crear la cuenta del dependiente' },
        { status: 500 }
      );
    }

    // Crear el perfil del dependiente en la tabla Profile
    try {
      await prisma.profile.create({
        data: {
          id: supabaseUser.id,
          email: dependentEmail,
          name: firstName,
          lastName: lastName,
          documentId: documentId,
          country: country,
          birthDate: new Date(birthDate),
          role: 'dependent'
        }
      });
    } catch (profileError) {
      // Si falla crear el perfil, limpiar el usuario de Supabase
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      } catch (cleanupError) {
        console.error('Error limpiando usuario después de fallo:', cleanupError);
      }
      
      console.error('Error creando perfil:', profileError);
      return NextResponse.json(
        { error: 'Error creando perfil del dependiente' },
        { status: 500 }
      );
    }

    // Crear el registro en la tabla Dependent
    try {
      const newDependent = await prisma.dependent.create({
        data: {
          id: supabaseUser.id, // Usar el mismo ID que Supabase
          firstName,
          lastName,
          relationship,
          documentId,
          country,
          birthDate: new Date(birthDate),
          mainAccountId: user.id
        }
      });

      return NextResponse.json({
        success: true,
        dependent: newDependent,
        loginInfo: {
          email: dependentEmail,
          documentId: documentId,
          tempPassword: tempPassword
        },
        message: 'Dependiente creado exitosamente'
      });

    } catch (dependentError) {
      // Si falla crear el dependiente, limpiar todo
      try {
        await prisma.profile.delete({ where: { id: supabaseUser.id } });
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      } catch (cleanupError) {
        console.error('Error limpiando después de fallo:', cleanupError);
      }
      
      console.error('Error creando dependiente:', dependentError);
      return NextResponse.json(
        { error: 'Error creando registro del dependiente' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error general en POST dependent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar dependiente
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const dependentId = url.searchParams.get('id');

    if (!dependentId) {
      return NextResponse.json(
        { error: 'ID del dependiente requerido' },
        { status: 400 }
      );
    }

    const { firstName, lastName, relationship, documentId, birthDate, country } = await request.json();

    // Validar datos requeridos
    if (!firstName || !lastName || !relationship || !documentId || !birthDate || !country) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que el dependiente existe y pertenece al usuario
    const existingDependent = await prisma.dependent.findUnique({
      where: { id: dependentId }
    });

    if (!existingDependent) {
      return NextResponse.json(
        { error: 'Dependiente no encontrado' },
        { status: 404 }
      );
    }

    if (existingDependent.mainAccountId !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para editar este dependiente' },
        { status: 403 }
      );
    }

    // Verificar que no haya conflicto con otro documento (si cambió)
    if (existingDependent.documentId !== documentId) {
      const conflictingDependent = await prisma.dependent.findUnique({
        where: { documentId }
      });

      if (conflictingDependent) {
        return NextResponse.json(
          { error: 'Ya existe otro dependiente con este número de documento' },
          { status: 400 }
        );
      }
    }

    // Actualizar el dependiente
    const updatedDependent = await prisma.dependent.update({
      where: { id: dependentId },
      data: {
        firstName,
        lastName,
        relationship,
        documentId,
        country,
        birthDate: new Date(birthDate)
      }
    });

    // También actualizar el perfil correspondiente
    try {
      await prisma.profile.update({
        where: { id: dependentId },
        data: {
          name: firstName,
          lastName: lastName,
          documentId: documentId,
          country: country,
          birthDate: new Date(birthDate)
        }
      });
    } catch (profileUpdateError) {
      console.error('Error actualizando perfil del dependiente:', profileUpdateError);
      // Continuar aunque falle la actualización del perfil
    }

    return NextResponse.json({
      success: true,
      dependent: updatedDependent,
      message: 'Dependiente actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error en PUT dependent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Obtener dependientes del usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const dependents = await prisma.dependent.findMany({
      where: { mainAccountId: user.id },
      include: {
        vaccines: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      dependents: dependents
    });

  } catch (error) {
    console.error('Error en GET dependents:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar dependiente
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const dependentId = url.searchParams.get('id');

    if (!dependentId) {
      return NextResponse.json(
        { error: 'ID del dependiente requerido' },
        { status: 400 }
      );
    }

    // Verificar que el dependiente existe y pertenece al usuario
    const existingDependent = await prisma.dependent.findUnique({
      where: { id: dependentId }
    });

    if (!existingDependent) {
      return NextResponse.json(
        { error: 'Dependiente no encontrado' },
        { status: 404 }
      );
    }

    if (existingDependent.mainAccountId !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar este dependiente' },
        { status: 403 }
      );
    }

    // Eliminar en orden: primero las vacunas, luego el dependiente, luego el perfil, luego el usuario de Supabase
    try {
      // Eliminar vacunas del dependiente
      await prisma.vaccine.deleteMany({
        where: { dependentId: dependentId }
      });

      // Eliminar el registro de dependiente
      await prisma.dependent.delete({
        where: { id: dependentId }
      });

      // Eliminar el perfil
      await prisma.profile.delete({
        where: { id: dependentId }
      });

      // Eliminar el usuario de Supabase
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabaseAdmin.auth.admin.deleteUser(dependentId);

    } catch (deleteError) {
      console.error('Error eliminando dependiente:', deleteError);
      return NextResponse.json(
        { error: 'Error eliminando dependiente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dependiente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE dependent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
