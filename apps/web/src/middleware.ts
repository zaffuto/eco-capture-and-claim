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
  try {
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

    // Construir la URL de redirección
    const redirectUrl = new URL('https://app.ecocupon.cl');

    // Preservar la ruta actual como parámetro de consulta si no es la raíz
    if (path !== '/') {
      redirectUrl.searchParams.set('from', path);
    }

    // Preservar los parámetros de consulta existentes
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    // Configurar la redirección con las opciones adecuadas
    const response = NextResponse.redirect(redirectUrl, {
      status: 307, // Redirección temporal
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    // Agregar headers de seguridad
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // En caso de error, redirigir a la URL base de ecocupon
    return NextResponse.redirect('https://app.ecocupon.cl', {
      status: 307
    });
  }
}

export const config = {
  // Matcher que excluye explícitamente las rutas públicas
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static
     * - images
     * - favicon.ico
     * - robots.txt
     * - manifest.json
     * - api
     */
    '/((?!_next|static|images|favicon\\.ico|robots\\.txt|manifest\\.json|api).*)'
  ]
};
