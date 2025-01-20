import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rutas que no deben ser redirigidas (archivos estáticos, etc.)
const PUBLIC_PATHS = [
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

  // Si es la ruta raíz o cualquier otra ruta, redirigir a app.ecocupon.cl
  const redirectUrl = new URL('https://app.ecocupon.cl');

  // Preservar los parámetros de consulta existentes
  request.nextUrl.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  // Agregar la ruta actual como parámetro si no es la raíz
  if (path !== '/') {
    redirectUrl.pathname = path;
  }

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

// Configurar el matcher para que aplique a todas las rutas excepto las públicas
export const config = {
  matcher: [
    // Excluir rutas públicas
    '/((?!_next/|static/|images/|favicon.ico|robots.txt|manifest.json|api/).*)',
  ],
};
