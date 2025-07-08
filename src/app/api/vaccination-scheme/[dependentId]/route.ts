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
    console.log('🔍 Buscando dependiente con ID:', dependentId);

    // 1. Usar consulta SQL directa para obtener el dependiente
    const dependentResult = await prisma.$queryRaw`
      SELECT * FROM "Dependent" WHERE id = ${dependentId}::uuid
    `;
    
    console.log('📊 Resultado dependiente:', dependentResult);
    
    const dependent = Array.isArray(dependentResult) ? dependentResult[0] : null;

    if (!dependent) {
      console.log('❌ Dependiente no encontrado');
      return NextResponse.json({ error: 'Dependiente no encontrado' }, { status: 404 });
    }

    console.log('✅ Dependiente encontrado:', dependent);

    // 2. Obtener las vacunas del dependiente
    const vaccinesResult = await prisma.$queryRaw`
      SELECT * FROM "Vaccine" WHERE "dependentId" = ${dependentId}::uuid
    `;
    
    console.log('💉 Vacunas encontradas:', vaccinesResult);
    
    const vaccines = Array.isArray(vaccinesResult) ? vaccinesResult : [];

    // 3. Obtener el código del país
    const country = countries.find(c => c.name === (dependent as any).country);
    const countryCode = country?.code || 'DEFAULT';
    
    console.log('🌍 País:', (dependent as any).country, 'Código:', countryCode);

    // 4. Obtener el esquema de vacunación para el país
    const countrySchedule = schedules[countryCode] || schedules['DEFAULT'];
    
    console.log('📋 Esquema encontrado:', countrySchedule.length, 'vacunas');

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

    const response = {
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
    };

    console.log('✅ Respuesta exitosa:', {
      dependentName: `${(dependent as any).firstName} ${(dependent as any).lastName}`,
      vaccinesCount: vaccines.length,
      schemeCount: processedScheme.length,
      completedCount
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error al obtener esquema de vacunación:', error);
    console.error('Stack trace:', (error as Error).stack);
    return NextResponse.json({ 
      error: `Error interno del servidor: ${(error as Error).message}` 
    }, { status: 500 });
  }
}
