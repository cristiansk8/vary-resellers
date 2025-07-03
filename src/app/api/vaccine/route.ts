import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    console.log('API /api/vaccine called');
    const body = await req.json();
    console.log('API received body:', body);
    const {
      vaccineName,
      dose,
      vaccinationDate,
      vaccinationPlace,
      healthProfessional,
      vaccineLot,
      vaccineProofUrl,
      profileId,
      dependentId
    } = body;

    // Validación básica
    if (!vaccineName || !dose || !vaccinationDate || !vaccinationPlace || !healthProfessional || (!profileId && !dependentId)) {
      console.log('API error: missing fields');
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const vaccine = await prisma.vaccine.create({
      data: {
        vaccineName,
        dose,
        vaccinationDate: new Date(vaccinationDate),
        vaccinationPlace,
        healthProfessional,
        vaccineLot,
        vaccineProofUrl,
        ...(dependentId ? { dependentId } : { profileId })
      }
    });
    console.log('API vaccine created:', vaccine);
    return NextResponse.json({ success: true, vaccine });
  } catch (error) {
    console.log('API error:', error);
    return NextResponse.json({ error: 'Error al guardar la vacuna', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    await prisma.vaccine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar la vacuna', details: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    const body = await req.json();
    const {
      vaccineName,
      dose,
      vaccinationDate,
      vaccinationPlace,
      healthProfessional,
      vaccineLot,
      vaccineProofUrl,
      profileId
    } = body;
    // Validación básica
    if (!vaccineName || !dose || !vaccinationDate || !vaccinationPlace || !healthProfessional || !profileId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const vaccine = await prisma.vaccine.update({
      where: { id },
      data: {
        vaccineName,
        dose,
        vaccinationDate: new Date(vaccinationDate),
        vaccinationPlace,
        healthProfessional,
        vaccineLot,
        vaccineProofUrl,
        profileId
      }
    });
    return NextResponse.json({ success: true, vaccine });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la vacuna', details: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');
    const dependentId = searchParams.get('dependentId');
    let where: any = {};
    if (dependentId) {
      where.dependentId = dependentId;
    } else if (profileId) {
      where.profileId = profileId;
    }
    const vaccines = await prisma.vaccine.findMany({
      where,
      orderBy: { vaccinationDate: 'desc' }
    });
    return NextResponse.json({ vaccines });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener vacunas', details: String(error) }, { status: 500 });
  }
}
