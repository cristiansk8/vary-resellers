import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, relationship, documentId, country, birthDate } = body;
    // Obtener usuario logueado
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const prisma = new PrismaClient();
    const dependent = await prisma.dependent.create({
      data: {
        firstName,
        lastName,
        relationship,
        documentId,
        country,
        birthDate: new Date(birthDate),
        mainAccountId: user.id,
      },
    });
    return NextResponse.json({ success: true, dependent });
  } catch (error) {
    const errMsg = (error as any)?.message || 'Unknown error';
    return NextResponse.json({ success: false, error: errMsg });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }
    const body = await req.json();
    const { firstName, lastName, relationship, documentId, country, birthDate } = body;
    const prisma = new PrismaClient();
    const dependent = await prisma.dependent.update({
      where: { id },
      data: {
        firstName,
        lastName,
        relationship,
        documentId,
        country,
        birthDate: new Date(birthDate),
      },
    });
    return NextResponse.json({ success: true, dependent });
  } catch (error) {
    const errMsg = (error as any)?.message || 'Unknown error';
    return NextResponse.json({ success: false, error: errMsg });
  }
}
