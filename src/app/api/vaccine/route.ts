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
      profileId
    } = body;

    // Validación básica
    if (!vaccineName || !dose || !vaccinationDate || !vaccinationPlace || !healthProfessional || !profileId) {
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
        profileId
      }
    });
    console.log('API vaccine created:', vaccine);
    return NextResponse.json({ success: true, vaccine });
  } catch (error) {
    console.log('API error:', error);
    return NextResponse.json({ error: 'Error al guardar la vacuna', details: String(error) }, { status: 500 });
  }
}
