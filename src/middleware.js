import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('sb-access-token')?.value;

  // Si intenta acceder a un sub-path protegido sin token, redirigir al CRM principal
  if ((pathname.startsWith('/crm/') || pathname.startsWith('/dashboard_admin/') || pathname.startsWith('/admin/')) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/crm';
    url.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard_admin/:path*', '/crm/:path*'],
};
