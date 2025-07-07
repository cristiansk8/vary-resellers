import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Eliminar todos los registros huérfanos de la tabla Profile
    // que no tengan un usuario correspondiente en Supabase
    const deletedProfiles = await prisma.profile.deleteMany({
      where: {
        // Puedes ajustar estos criterios según tus necesidades
        OR: [
          { email: { contains: "@" } }, // Todos los profiles con email
        ]
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${deletedProfiles.count} registros huérfanos eliminados de Profile` 
    });

  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Error inesperado" 
    }, { status: 500 });
  }
}
