import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Buscar usuario en Supabase por email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    
    // 2. Si existe en Supabase, eliminarlo
    if (user) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // 3. Eliminar de la tabla Profile usando Prisma
    try {
      await prisma.profile.deleteMany({
        where: {
          email: email
        }
      });
    } catch (prismaError) {
      // Si no existe en Profile, no es un error crítico
      console.log("Profile not found or already deleted:", prismaError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Usuario con email ${email} eliminado completamente` 
    });

  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Error inesperado" 
    }, { status: 500 });
  }
}
