import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('sb-access-token')?.value;

  // Definir rutas protegidas (admin, dashboard_admin y subrutas de crm, permitiendo /crm para login)
  const isProtected = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard_admin') || 
    (pathname.startsWith('/crm/') && pathname !== '/crm');

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/crm';
    url.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/admin',
    '/dashboard_admin/:path*', 
    '/dashboard_admin',
    '/crm/:path*'
  ],
};
