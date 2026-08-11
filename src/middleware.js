import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('sb-access-token')?.value;

  const isCrmRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard_admin') || 
    pathname.startsWith('/crm');

  // Factor 1: Filtrado de IP (si está configurada la variable CRM_ALLOWED_IPS)
  const allowedIpsEnv = process.env.CRM_ALLOWED_IPS;
  if (isCrmRoute && allowedIpsEnv) {
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  req.headers.get('x-real-ip') || 
                  req.ip || '';
    const allowedIps = allowedIpsEnv.split(',').map(ip => ip.trim()).filter(Boolean);
    const isLocalhost = rawIp === '127.0.0.1' || rawIp === '::1' || rawIp === '::ffff:127.0.0.1';

    if (allowedIps.length > 0 && !isLocalhost && !allowedIps.includes(rawIp)) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>403 Acceso Denegado - IP No Autorizada</title></head>
        <body style="background:#080808;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:40px;border:1px solid #cb9f74;border-radius:20px;background:#121212;max-width:450px;">
            <h1 style="color:#cb9f74;font-size:24px;margin-bottom:10px;">🔒 Acceso Restringido por IP</h1>
            <p style="color:#aaa;font-size:14px;line-height:1.5;">Tu dirección IP (<strong>${rawIp || 'Desconocida'}</strong>) no está autorizada para acceder al CRM de Inmobiliaria Norte Chico.</p>
            <p style="color:#666;font-size:12px;margin-top:20px;">Contacta al administrador para habilitar esta red Wi-Fi/Dispositivo.</p>
          </div>
        </body>
        </html>`,
        { status: 403, headers: { 'content-type': 'text/html; charset=utf-8' } }
      );
    }
  }

  // Definir rutas protegidas por token de sesión
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
