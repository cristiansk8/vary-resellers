import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Mantenemos una respuesta base que permite continuar la petición
  const res = NextResponse.next();
  
  // Creamos el cliente de Supabase específico para middleware
  const supabase = createMiddlewareClient({ req, res });

  // Refrescamos la sesión del usuario (importante para mantenerla activa)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // --- LÓGICA DE AUTENTICACIÓN MEJORADA ---

  // 1. Definimos nuestras rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  const reqUrl = new URL(req.url);
  const isPublicRoute = publicRoutes.includes(reqUrl.pathname);

  // 2. REGLA DE PROTECCIÓN: Si el usuario NO tiene sesión y la ruta NO es pública...
  // ...lo redirigimos a la página de login.
  if (!session && !isPublicRoute) {
    // Usamos new URL() para construir la ruta de forma segura.
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // 3. REGLA DE CONVENIENCIA: Si el usuario SÍ tiene sesión y está intentando acceder
  // a las páginas de login o registro...
  if (session && (reqUrl.pathname === '/sign-in' || reqUrl.pathname === '/sign-up')) {
    // ...lo redirigimos a su dashboard, que es su página principal privada.
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Si ninguna de las reglas anteriores se cumple, la petición puede continuar.
  return res;
}

// La configuración del matcher sigue siendo la misma.
// Excluye rutas de API, assets estáticos, etc., para mejorar el rendimiento.
export const config = {
  matcher: [
    "/((?!api|auth/callback|images|icons|_next/static|_next/image|favicon.ico).*)",
  ],
};