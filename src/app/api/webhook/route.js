import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();

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

    // Insert into Supabase 'clientes' table
    const { data, error } = await supabase.from('clientes').insert([{
      nombre: nombre,
      telefono: telefono,
      email: email,
      origen: origen,
      notas: notas,
      estado: 'Nuevo'
    }]).select();

    if (error) {
      console.error("Error inserting lead into Supabase:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active and ready for HTTP POST' });
}
