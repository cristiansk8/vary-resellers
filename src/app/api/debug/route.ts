import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Listar todas las tablas disponibles
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📊 Tablas disponibles:', tables);
    
    // Intentar consultar dependientes
    const dependents = await prisma.$queryRaw`
      SELECT id, "firstName", "lastName", country 
      FROM "Dependent" 
      LIMIT 5
    `;
    
    console.log('👥 Dependientes encontrados:', dependents);
    
    // También consultar vacunas para ver la estructura
    const vaccines = await prisma.$queryRaw`
      SELECT id, "vaccineName", "dependentId"
      FROM "Vaccine" 
      LIMIT 3
    `;
    
    console.log('💉 Vacunas encontradas:', vaccines);
    
    return NextResponse.json({
      tables,
      dependents,
      vaccines,
      message: 'Diagnóstico completado'
    });
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json({ 
      error: (error as Error).message,
      stack: (error as Error).stack 
    }, { status: 500 });
  }
}
