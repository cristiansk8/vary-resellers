// Test script para verificar el login con documento
// Este archivo es solo para testing y no debe ir a producción

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'test.document@vacun.org',
      password: 'test123456',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created:', authUser.user?.id);

    // Crear perfil en nuestra base de datos
    const profile = await prisma.profile.create({
      data: {
        id: authUser.user.id,
        email: 'test.document@vacun.org',
        name: 'Usuario',
        lastName: 'Prueba Documento',
        documentId: '12345678', // Este es el documento que usaremos para probar
        country: 'Colombia',
        birthDate: new Date('1990-01-01'),
        role: 'user'
      }
    });

    console.log('Profile created:', profile);
    console.log('Ahora puedes hacer login con:');
    console.log('Email: test.document@vacun.org');
    console.log('Documento: 12345678');
    console.log('Contraseña: test123456');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Solo ejecutar si se llama directamente
createTestUser();

export { createTestUser };
