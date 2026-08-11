import { NextResponse } from 'next/server';

export async function GET(req) {
  // Retorna la dirección IP pública actual del visitante
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1';

  return NextResponse.json({
    ip: clientIp,
    allowed_ips_configured: Boolean(process.env.CRM_ALLOWED_IPS),
  });
}

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Código 2FA requerido' }, { status: 400 });
    }

    // Código 2FA Maestro o de entorno (Por defecto 192837 si no hay variable de entorno)
    const masterPin = process.env.CRM_2FA_PIN || '192837';

    if (code.trim() === masterPin) {
      return NextResponse.json({ success: true, message: 'Verificación 2FA completada' });
    } else {
      return NextResponse.json({ success: false, error: 'Código 2FA incorrecto o expirado' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error interno en la verificación 2FA' }, { status: 500 });
  }
}
