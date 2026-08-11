import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

async function sendTelegramMessage(chatId, text, parseMode = 'Markdown') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: false
      })
    });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    bot_configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    message: 'Telegram Webhook Endpoint está activo'
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body || !body.message) {
      return NextResponse.json({ ok: true });
    }

    const { chat, text, from } = body.message;
    const chatId = chat?.id;
    const userFirstName = from?.first_name || 'Cliente';
    const cleanText = (text || '').trim().toLowerCase();

    if (!chatId || !cleanText) {
      return NextResponse.json({ ok: true });
    }

    // 1. Comando /start o Saludos
    if (cleanText === '/start' || cleanText.includes('hola') || cleanText.includes('menu')) {
      const welcomeMsg = `👋 *¡Hola ${userFirstName}!* Bienvenido al Bot Oficial de *Inmobiliaria Norte Chico* 🏗️✨\n\nPuedes consultar nuestro catálogo en vivo y la información del CRM enviando los siguientes comandos:\n\n🏠 */propiedades* - Ver terrenos y lotes disponibles\n📊 */kpis* - Resumen del catálogo e inventario\n📞 */contacto* - Hablar con un asesor comercial`;
      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // 2. Comando /propiedades o Terrenos
    if (cleanText.includes('/propiedades') || cleanText.includes('propiedades') || cleanText.includes('terrenos') || cleanText.includes('lotes')) {
      const { data: properties, error } = await supabase
        .from('propiedades')
        .select('*')
        .eq('estado', 'Disponible')
        .limit(6);

      if (error || !properties || properties.length === 0) {
        await sendTelegramMessage(chatId, `⚠️ Actualmente no hay propiedades disponibles o hubo un problema al consultar la base de datos.`);
        return NextResponse.json({ ok: true });
      }

      let responseMsg = `🏠 *PROPIEDADES Y TERRENOS DISPONIBLES (${properties.length})*\n\n`;

      properties.forEach((p, idx) => {
        const precioFormatted = p.precio ? `$${parseFloat(p.precio).toLocaleString()} USD` : 'Consultar';
        const areaFormatted = p.area_m2 || p.area ? `${p.area_m2 || p.area} m²` : 'N/A';
        const ubicacion = p.ubicacion || 'Chancay';
        const link = `https://inmobiliarianortechico.pe/proyecto/${p.id}`;

        responseMsg += `*${idx + 1}. ${p.titulo}*\n📍 Ubicación: ${ubicacion}\n💵 Precio: *${precioFormatted}*\n📐 Área: ${areaFormatted}\n🔗 [Ver Ficha Técnica en la Web](${link})\n\n`;
      });

      responseMsg += `💬 _Para agendar una visita a cualquiera de estos terrenos, escríbenos a nuestro WhatsApp oficial._`;

      await sendTelegramMessage(chatId, responseMsg);
      return NextResponse.json({ ok: true });
    }

    // 3. Comando /kpis o Resumen
    if (cleanText.includes('/kpis') || cleanText.includes('kpis') || cleanText.includes('resumen')) {
      const { data: properties } = await supabase.from('propiedades').select('id, estado');
      const totalProps = properties?.length || 0;
      const disponibles = properties?.filter(p => p.estado === 'Disponible').length || 0;
      const reservados = properties?.filter(p => p.estado === 'Reservado').length || 0;
      const vendidos = properties?.filter(p => p.estado === 'Vendido').length || 0;

      const kpisMsg = `📊 *RESUMEN DE INVENTARIO CRM*\n\n🏗️ *Total Proyectos:* ${totalProps}\n🟢 *Disponibles:* ${disponibles}\n🟡 *Reservados:* ${reservados}\n🔴 *Vendidos:* ${vendidos}\n\n🛡️ *Saneamiento Legal:* 100% Inscritos en SUNARP\n🌐 *Web:* [inmobiliarianortechico.pe](https://inmobiliarianortechico.pe)`;
      await sendTelegramMessage(chatId, kpisMsg);
      return NextResponse.json({ ok: true });
    }

    // 4. Comando /contacto
    if (cleanText.includes('/contacto') || cleanText.includes('contacto') || cleanText.includes('asesor')) {
      const contactoMsg = `📞 *ATENCIÓN AL CLIENTE & ASESORÍA COMERCIAL*\n\n📍 *Oficina:* Chancay / Huaral - Lima Norte\n💬 *WhatsApp:* [Contactar Asesor](https://wa.me/51900000000)\n🌐 *Sitio Web:* https://inmobiliarianortechico.pe`;
      await sendTelegramMessage(chatId, contactoMsg);
      return NextResponse.json({ ok: true });
    }

    // Respuesta por defecto si no reconoce el comando
    const defaultMsg = `💡 No entendí tu consulta. Por favor escribe */start* para ver el menú principal o */propiedades* para ver los terrenos en venta.`;
    await sendTelegramMessage(chatId, defaultMsg);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: true });
  }
}
