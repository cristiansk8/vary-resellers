import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { loginIdentifier, password } = await request.json();
    
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Login identifier and password are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Primero intentamos como email directo
    let authResult = await supabase.auth.signInWithPassword({
      email: loginIdentifier,
      password
    });

    // Si falla y no es un email válido, buscamos por número de documento
    if (authResult.error && !loginIdentifier.includes('@')) {
      try {
        // Buscar el usuario por número de documento en nuestra tabla Profile
        const profile = await prisma.profile.findUnique({
          where: {
            documentId: loginIdentifier
          },
          select: {
            email: true,
            id: true,
            name: true,
            lastName: true
          }
        });

        if (profile && profile.email) {
          // Si encontramos el perfil, intentamos login con el email
          authResult = await supabase.auth.signInWithPassword({
            email: profile.email,
            password
          });
        }
      } catch (dbError) {
        console.error('Database error when searching by document:', dbError);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    if (authResult.error) {
      console.error('Auth error:', authResult.error);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Si el login fue exitoso, obtenemos los datos del perfil
    const userId = authResult.data.user?.id;
    if (userId) {
      try {
        const profile = await prisma.profile.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            documentId: true,
            country: true,
            role: true
          }
        });

        return NextResponse.json({
          success: true,
          user: authResult.data.user,
          profile: profile
        });
      } catch (dbError) {
        console.error('Error fetching profile:', dbError);
        // Aunque falle obtener el perfil, el login fue exitoso
        return NextResponse.json({
          success: true,
          user: authResult.data.user,
          profile: null
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: authResult.data.user,
      profile: null
    });

  } catch (error) {
    console.error('Login endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
