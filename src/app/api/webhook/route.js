import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { z } from 'zod';

export async function POST(req) {
  const supabase = createClient();
  try {
    const rawBody = await req.text();
    
    // HMAC Signature Validation for Facebook Lead Ads
    const signature = req.headers.get('x-hub-signature-256');
    const fbAppSecret = process.env.FACEBOOK_APP_SECRET;

    if (fbAppSecret) {
      if (!signature) {
        console.warn("⚠️ Meta Webhook: Missing HMAC Signature.");
        return NextResponse.json({ success: false, error: 'Missing Signature' }, { status: 401 });
      }
      const hmac = crypto.createHmac('sha256', fbAppSecret);
      const digest = `sha256=${hmac.update(rawBody).digest('hex')}`;
      
      if (signature !== digest) {
        console.warn("⚠️ Meta Webhook: Invalid HMAC Signature detected.");
        return NextResponse.json({ success: false, error: 'Invalid Signature' }, { status: 401 });
      }
    } else if (!fbAppSecret && signature) {
      console.warn("⚠️ Meta Webhook: Signature present but FACEBOOK_APP_SECRET missing. Simulating success...");
    }

    const body = JSON.parse(rawBody);

    // Multi-format Lead Parser (Facebook Lead Ads / TikTok Ads / Web Form)
    let nombre = body.nombre || body.nombre_completo || body.full_name || 'Lead Anónimo';
    let telefono = body.telefono || body.phone || body.phone_number || '';
    let email = body.email || body.mail || '';
    let origen = body.origen || body.source || 'Webhook Externo';
    let notas = body.notas || body.tipo_interes || body.message || 'Lead capturado desde Webhook';

    // Parse Facebook Lead Ads field_data array if present
    if (body.field_data && Array.isArray(body.field_data)) {
      body.field_data.forEach(item => {
        if (item.name === 'full_name' || item.name === 'nombre') nombre = item.values?.[0] || nombre;
        if (item.name === 'phone_number' || item.name === 'telefono') telefono = item.values?.[0] || telefono;
        if (item.name === 'email') email = item.values?.[0] || email;
      });
      origen = 'Facebook Lead Ads';
    }

    // Zod Schema para sanitizar y tipar la inserción
    const leadSchema = z.object({
      nombre_completo: z.string().min(2, "Nombre muy corto").max(255).transform(s => s.replace(/<[^>]*>?/gm, '').trim()),
      telefono: z.string().max(50).transform(s => s.replace(/[^0-9+]/g, '').trim()),
      email: z.string().email("Email inválido").or(z.literal('')).transform(s => s.trim().toLowerCase()),
      origen: z.string().max(255).transform(s => s.replace(/<[^>]*>?/gm, '').trim()),
      tipo_interes: z.string().max(1000).transform(s => s.replace(/<[^>]*>?/gm, '').trim()),
      estado_lead: z.string().default('Nuevo')
    });

    let validatedData;
    try {
      validatedData = leadSchema.parse({
        nombre_completo: nombre,
        telefono: telefono,
        email: email,
        origen: origen,
        tipo_interes: notas
      });
    } catch (zodError) {
      console.warn("⚠️ Meta Webhook: Datos no superaron esquema Zod", zodError.errors);
      return NextResponse.json({ success: false, error: 'Estructura de datos inválida', details: zodError.errors }, { status: 400 });
    }

    // Insert into Supabase 'clientes' table
    const { data, error } = await supabase.from('clientes').insert([validatedData]).select();

    if (error) {
      console.error("Error inserting lead into Supabase:", error);
      return NextResponse.json({ success: false, error: 'Error interno al procesar el registro.' }, { status: 500 });
    }

    // Optional Telegram Notification API call
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const telegramMsg = `🚨 *NUEVO LEAD CAPTURADO*\n\n👤 *Nombre:* ${nombre}\n📞 *Teléfono:* ${telefono}\n📧 *Email:* ${email}\n🌐 *Origen:* ${origen}\n📝 *Notas:* ${notas}`;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMsg,
            parse_mode: 'Markdown'
          })
        });
      } catch (tErr) {
        console.error("Telegram alert failed:", tErr);
      }
    }

    return NextResponse.json({ success: true, lead: data }, { status: 200 });

  } catch (err) {
    console.error("Webhook Handler Error:", err);
    return NextResponse.json({ success: false, error: 'Solicitud inválida o mal formada.' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
