import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, documentId, birthDate, phone, country } = body;
    // Obtener usuario autenticado
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const prisma = new PrismaClient();
    const updated = await prisma.profile.update({
      where: { id: user.id },
      data: {
        name: firstName,
        lastName,
        email,
        documentId,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        country
      }
    });
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}
