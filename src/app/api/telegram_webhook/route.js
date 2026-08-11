import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

export const dynamic = 'force-dynamic';

const BOT_TOKEN_DEFAULT = '8270838507:AAEBNhdb3tldXmG5p4Kdn17TLQtA2-gqbSw';

async function sendTelegramMessage(chatId, text, parseMode = 'Markdown') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || BOT_TOKEN_DEFAULT;
  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || BOT_TOKEN_DEFAULT;
  return NextResponse.json({
    status: 'online',
    bot_configured: Boolean(botToken),
    message: 'Asistente Interno CRM en Telegram activo'
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
    const userFirstName = from?.first_name || 'Administrador';
    const cleanText = (text || '').trim().toLowerCase();

    if (!chatId || !cleanText) {
      return NextResponse.json({ ok: true });
    }

    // 1. Menú Principal de Administración Interna (/start, /ayuda, hola, menu)
    if (cleanText === '/start' || cleanText === '/ayuda' || cleanText.includes('hola') || cleanText.includes('menu')) {
      const menuMsg = `👨‍💼 *ASISTENTE INTERNO CRM - INMOBILIARIA NORTE CHICO*\n\n¡Hola ${userFirstName}! Gestiona tu CRM directamente desde Telegram sin entrar a la web:\n\n📊 */kpis* - Resumen de ventas, inventario y métricas\n👥 */leads* - Ver últimos prospectos y contactar por WhatsApp\n🏠 */propiedades* - Estado de lotes y catálogo\n🚨 *Alertas:* Recibirás avisos de nuevos leads al instante.`;
      await sendTelegramMessage(chatId, menuMsg);
      return NextResponse.json({ ok: true });
    }

    // 2. Consulta de KPIs del CRM (/kpis, resumen, metricas)
    if (cleanText.includes('/kpis') || cleanText.includes('kpis') || cleanText.includes('resumen') || cleanText.includes('metricas')) {
      const { data: properties } = await supabase.from('propiedades').select('id, estado, precio');
      const { data: clientes } = await supabase.from('clientes').select('id, estado_lead, created_at');

      const totalProps = properties?.length || 0;
      const disponibles = properties?.filter(p => p.estado === 'Disponible').length || 0;
      const reservados = properties?.filter(p => p.estado === 'Reservado').length || 0;
      const vendidos = properties?.filter(p => p.estado === 'Vendido').length || 0;

      const totalLeads = clientes?.length || 0;
      const nuevosLeads = clientes?.filter(c => c.estado_lead === 'Nuevo' || !c.estado_lead).length || 0;
      const ganados = clientes?.filter(c => c.estado_lead === 'Ganado').length || 0;

      const kpisMsg = `📊 *MÉTRICAS Y KPIS DEL CRM EN VIVO*\n\n🏠 *INVENTARIO DE PROPIEDADES:*
• Total Lotes: *${totalProps}*
• Disponibles: 🟢 *${disponibles}*
• Reservados: 🟡 *${reservados}*
• Vendidos: 🔴 *${vendidos}*

👥 *LEADS Y PROSPECTOS:*
• Total Registrados: *${totalLeads}*
• Leads Nuevos sin contactar: ⚡ *${nuevosLeads}*
• Clientes Ganados: 🎉 *${ganados}*

🛡️ *Saneamiento Legal:* 100% SUNARP
🔗 *CRM Web:* https://inmobiliarianortechico.pe/crm`;

      await sendTelegramMessage(chatId, kpisMsg);
      return NextResponse.json({ ok: true });
    }

    // 3. Consulta de Últimos Leads (/leads, prospectos, clientes)
    if (cleanText.includes('/leads') || cleanText.includes('leads') || cleanText.includes('prospectos') || cleanText.includes('clientes')) {
      const { data: latestLeads, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

      if (error || !latestLeads || latestLeads.length === 0) {
        await sendTelegramMessage(chatId, `⚠️ No hay leads registrados en el CRM actualmente.`);
        return NextResponse.json({ ok: true });
      }

      let leadsMsg = `👥 *ÚLTIMOS 5 LEADS REGISTRADOS EN EL CRM*\n\n`;

      latestLeads.forEach((c, idx) => {
        const nombre = c.nombre || c.nombre_completo || 'Cliente Sin Nombre';
        const rawPhone = (c.telefono || '').replace(/[^0-9]/g, '');
        const telefonoDisplay = c.telefono || 'Sin teléfono';
        const estado = c.estado_lead || c.estado || 'Nuevo';
        const interes = c.notas || c.tipo_interes || 'Sin especificación';
        
        // Link directo de WhatsApp para contactar con 1 clic
        const waLink = rawPhone ? `https://wa.me/${rawPhone}?text=Hola%20${encodeURIComponent(nombre)},%20te%20contactamos%20de%20Inmobiliaria%20Norte%20Chico.` : '#';

        leadsMsg += `*${idx + 1}. ${nombre}*\n📞 Tel: \`${telefonoDisplay}\`\n📌 Estado: *${estado}*\n📝 Notas: ${interes}\n💬 [Contactar por WhatsApp](${waLink})\n------------------------\n`;
      });

      leadsMsg += `\n⚡ _Usa los enlaces para escribirles por WhatsApp con un solo toque desde tu teléfono._`;

      await sendTelegramMessage(chatId, leadsMsg);
      return NextResponse.json({ ok: true });
    }

    // 4. Consulta de Propiedades (/propiedades, inventario, terrenos)
    if (cleanText.includes('/propiedades') || cleanText.includes('propiedades') || cleanText.includes('inventario') || cleanText.includes('terrenos')) {
      const { data: properties } = await supabase
        .from('propiedades')
        .select('*')
        .order('id', { ascending: false })
        .limit(6);

      if (!properties || properties.length === 0) {
        await sendTelegramMessage(chatId, `⚠️ No hay propiedades registradas.`);
        return NextResponse.json({ ok: true });
      }

      let propsMsg = `🏠 *INVENTARIO DE TERRENOS Y PROPIEDADES*\n\n`;

      properties.forEach((p, idx) => {
        const precio = p.precio ? `$${parseFloat(p.precio).toLocaleString()} USD` : 'Consultar';
        const area = p.area_m2 || p.area ? `${p.area_m2 || p.area} m²` : 'N/A';
        const estado = p.estado === 'Disponible' ? '🟢 Disponible' : p.estado === 'Reservado' ? '🟡 Reservado' : '🔴 Vendido';

        propsMsg += `*${idx + 1}. ${p.titulo}*\nEstado: ${estado}\nPrecio: *${precio}* | Area: ${area}\n🔗 https://inmobiliarianortechico.pe/proyecto/${p.id}\n\n`;
      });

      await sendTelegramMessage(chatId, propsMsg);
      return NextResponse.json({ ok: true });
    }

    // Comandos no reconocidos
    const defaultMsg = `💡 Comando no reconocido. Escribe */ayuda* para ver las opciones disponibles:\n\n📊 */kpis*\n👥 */leads*\n🏠 */propiedades*`;
    await sendTelegramMessage(chatId, defaultMsg);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Admin Assistant Error:", error);
    return NextResponse.json({ ok: true });
  }
}

