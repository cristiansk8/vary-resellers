import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { loginIdentifier, password } = await request.json();
    
    console.log('🔐 Login attempt:', { loginIdentifier, hasPassword: !!password });
    
    if (!loginIdentifier || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Login identifier and password are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Primero intentamos como email directo
    console.log('📧 Attempting direct email login...');
    let authResult = await supabase.auth.signInWithPassword({
      email: loginIdentifier,
      password
    });

    console.log('📧 Direct email result:', { 
      success: !authResult.error, 
      error: authResult.error?.message,
      userId: authResult.data?.user?.id 
    });

    // Si falla y no es un email válido, buscamos por número de documento
    if (authResult.error && !loginIdentifier.includes('@')) {
      console.log('🆔 Direct email failed, trying document lookup...');
      console.log('🔍 Searching for document:', loginIdentifier);
      
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
            lastName: true,
            role: true
          }
        });

        console.log('📊 Profile lookup result:', { 
          found: !!profile, 
          email: profile?.email,
          role: profile?.role,
          id: profile?.id 
        });

        if (profile && profile.email) {
          console.log('📧 Found profile, attempting login with email:', profile.email);
          // Si encontramos el perfil, intentamos login con el email
          authResult = await supabase.auth.signInWithPassword({
            email: profile.email,
            password
          });
          
          console.log('📧 Email login result:', { 
            success: !authResult.error, 
            error: authResult.error?.message,
            userId: authResult.data?.user?.id 
          });
        } else {
          console.log('❌ No profile found with document:', loginIdentifier);
        }
      } catch (dbError) {
        console.error('💥 Database error when searching by document:', dbError);
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
