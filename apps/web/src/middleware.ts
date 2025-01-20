import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas que no deben ser redirigidas (archivos estáticos, etc.)
const PUBLIC_PATHS = [
  '/',  // Ruta principal
  '/_next',
  '/static',
  '/images',
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/api'
];

export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const path = request.nextUrl.pathname;

  // Verificar si la ruta actual es una ruta pública
  const isPublicPath = PUBLIC_PATHS.some(publicPath => 
    path.startsWith(publicPath)
  );

  // No redirigir rutas públicas
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si es cualquier otra ruta, redirigir a app.ecocupon.cl
  const redirectUrl = new URL('https://app.ecocupon.cl');

  // Preservar los parámetros de consulta existentes
  request.nextUrl.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  // Agregar la ruta actual como parámetro
  redirectUrl.pathname = path;

  // Configurar la redirección con las opciones adecuadas
  return NextResponse.redirect(redirectUrl, {
    status: 302, // Redirección temporal
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
