import { NextResponse } from 'next/server';

export function middleware(req) {
  // Middleware permite la navegación hacia la ruta CRM (/crm)
  // La vista AdminDashboardView se encarga del Auth Guard y formulario de login de Supabase en el cliente.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard_admin', '/dashboard_admin/:path*', '/crm', '/crm/:path*'],
};
