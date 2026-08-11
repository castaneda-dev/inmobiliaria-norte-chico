import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

// MAPA DE RATE LIMITING EN MEMORIA (VENTANA DESLIZANTE POR IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS_PER_WINDOW = 5; // Máximo 5 envíos por IP cada 10 min

function isRateLimited(ip) {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip) || [];
  
  // Limpiar marcas de tiempo antiguas fuera de la ventana
  const recentRequests = userRecord.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return false;
}

// FUNCIONES DE SANITIZACIÓN ANTI-INYECCIÓN & ANTI-XSS
function sanitizeInput(str, maxLength = 255) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML (<script>, <iframe>, etc)
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // Elimina caracteres de control y comillas peligrosas
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req) {
  try {
    // 1. OBTENER IP Y VERIFICAR RATE LIMITING ANTI-SPAM / ATAQUE MASIVO
    const forwardHeader = req.headers.get('x-forwarded-for');
    const clientIp = forwardHeader ? forwardHeader.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Demasiadas solicitudes. Por favor intente más tarde.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { nombre, email, telefono, prefijo, mensaje, website, confirm_address } = body;

    // 2. TRAMPA HONEYPOT ANTI-BOTS AUTOMATIZADOS
    // Si un bot rellena el campo trampa oculto 'website' o 'confirm_address', se descarta
    if (website || confirm_address) {
      console.warn(`[SECURITY WARN] Bot capturado por Honeypot desde IP: ${clientIp}`);
      return NextResponse.json({ success: true, message: 'Solicitud procesada' });
    }

    // 3. SANITIZACIÓN RIGUROSA DE DATOS (ANTI-XSS & ANTI-INYECCIÓN)
    const cleanNombre = sanitizeInput(nombre, 100);
    const cleanEmail = sanitizeInput(email, 100);
    const cleanTelefono = sanitizeInput(telefono, 20);
    const cleanPrefijo = sanitizeInput(prefijo, 10) || '+51';
    const cleanMensaje = sanitizeInput(mensaje, 1000);

    // 4. VALIDACIÓN DE CAMPOS REQUERIDOS
    if (!cleanNombre || (!cleanEmail && !cleanTelefono)) {
      return NextResponse.json({ success: false, error: 'Proporcione un nombre y un canal de contacto válido.' }, { status: 400 });
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'El formato de correo electrónico no es válido.' }, { status: 400 });
    }

    const fullPhone = `${cleanPrefijo} ${cleanTelefono}`.trim();

    // 5. INSERCIÓN SEGURA CON PARÁMETROS PREPARADOS EN SUPABASE (PREVIENE SQL INJECTION)
    const { data, error } = await supabase.from('clientes').insert([{
      nombre_completo: cleanNombre,
      email: cleanEmail,
      telefono: fullPhone,
      tipo_interes: cleanMensaje,
      estado_lead: 'Nuevo',
      origen: 'Web Next.js (Secure Mode)'
    }]);

    if (error) {
      console.error("Error al guardar lead vía API:", error);
      return NextResponse.json({ success: false, error: 'Error interno al procesar el registro.' }, { status: 500 });
    }

    // 6. NOTIFICACIÓN AUTOMÁTICA EN TIEMPO REAL A TELEGRAM
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8270838507:AAEBNhdb3tldXmG5p4Kdn17TLQtA2-gqbSw';
    const chatId = process.env.TELEGRAM_CHAT_ID || '8674291844';

    if (botToken && chatId) {
      try {
        const alertMsg = `🚨 *NUEVO LEAD CAPTURADO EN LA WEB*\n\n👤 *Nombre:* ${cleanNombre}\n📞 *Teléfono:* ${fullPhone}\n📧 *Email:* ${cleanEmail || 'No proporcionado'}\n📝 *Consulta:* ${cleanMensaje || 'Sin mensaje'}\n🌐 *Origen:* Formulario Web Next.js`;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: alertMsg,
            parse_mode: 'Markdown'
          })
        });
      } catch (tErr) {
        console.error("Telegram notification error:", tErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /contact error:", error);
    return NextResponse.json({ success: false, error: 'Error interno de procesamiento.' }, { status: 500 });
  }
}
