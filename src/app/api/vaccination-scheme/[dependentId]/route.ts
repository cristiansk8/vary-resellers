import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { schedules } from '@/lib/vaccinationSchedules';
import { countries } from '@/lib/countries';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { dependentId: string } }
) {
  try {
    const { dependentId } = params;

    // 1. Usar consulta SQL directa para obtener el dependiente
    const dependentResult = await prisma.$queryRaw`
      SELECT * FROM "Dependent" WHERE id = ${dependentId}
    `;
    
    const dependent = Array.isArray(dependentResult) ? dependentResult[0] : null;

    if (!dependent) {
      return NextResponse.json({ error: 'Dependiente no encontrado' }, { status: 404 });
    }

    // 2. Obtener las vacunas del dependiente
    const vaccinesResult = await prisma.$queryRaw`
      SELECT * FROM "Vaccine" WHERE "dependentId" = ${dependentId}
    `;
    
    const vaccines = Array.isArray(vaccinesResult) ? vaccinesResult : [];

    // 3. Obtener el código del país
    const country = countries.find(c => c.name === (dependent as any).country);
    const countryCode = country?.code || 'DEFAULT';

    // 4. Obtener el esquema de vacunación para el país
    const countrySchedule = schedules[countryCode] || schedules['DEFAULT'];

    // 5. Procesar el esquema comparando con las vacunas del dependiente
    const processedScheme = countrySchedule.map(scheduledVaccine => {
      // Verificar si el dependiente tiene esta vacuna
      const hasVaccine = vaccines.some((userVaccine: any) => 
        scheduledVaccine.keywords.some((keyword: string) => 
          userVaccine.vaccineName.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      return {
        ...scheduledVaccine,
        completed: hasVaccine
      };
    });

    // 6. Calcular estadísticas
    const completedCount = processedScheme.filter(v => v.completed).length;
    const totalCount = processedScheme.length;

    return NextResponse.json({
      dependent: {
        id: (dependent as any).id,
        firstName: (dependent as any).firstName,
        lastName: (dependent as any).lastName,
        country: (dependent as any).country,
        birthDate: (dependent as any).birthDate
      },
      scheme: processedScheme,
      stats: {
        completed: completedCount,
        total: totalCount,
        percentage: Math.round((completedCount / totalCount) * 100)
      }
    });

  } catch (error) {
    console.error('Error al obtener esquema de vacunación:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
