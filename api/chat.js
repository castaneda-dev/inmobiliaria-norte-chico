const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || "https://jlgnqiedkagkcqoakmom.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZ25xaWVka2Fna2Nxb2FrbW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDg2NjQsImV4cCI6MjEwMTI4NDY2NH0.vjTSpZ3gJO_iE0SKrSJczoND0DP-9tK7y3Hzr2n0eaE";
const supabase = createClient(supabaseUrl, supabaseKey);

// Variables de Telegram y Correo
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "admin@nortechico.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Contexto e instrucciones de la IA Inmobiliaria para Norte Chico
const SYSTEM_KNOWLEDGE = `
Eres la Asistente Virtual Oficial con Inteligencia Artificial de "Inmobiliaria Norte Chico".
Tu objetivo es ser amable, profesional, responder dudas sobre los proyectos inmobiliarios y motivar al cliente a agendar una visita o dejar sus datos de contacto (Nombre y WhatsApp).

INFORMACIÓN CLAVE DE PROYECTOS:
1. Proyecto Principal: Lotes Residenciales y de Campo en Huaral (Norte Chico de Lima).
2. Metrajes disponibles: Desde 120 m² hasta 500 m².
3. Precios: Lotes desde $15,000 USD (facilidades de pago y crédito directo con la inmobiliaria sin intermediación bancaria).
4. Titulación: Todos los terrenos cuentan con independización inscrita en SUNARP, servicios básicos proyectados y habilitación urbana.
5. Ubicación: A solo 1 hora y 15 minutos de Lima, excelente clima soleado todo el año, zonas turísticas y alta plusvalía.
6. Facilidades: Inicial al 20% y saldo hasta en 36 cuotas fijas sin intereses.

REGLAS DE CONVERSACIÓN:
- Sé concisa (mensajes de máximo 3 a 4 oraciones).
- Usa emojis inmobiliarios amigables (🏡, 📍, 🔑, 📈, 📱).
- Siempre ofrece coordinar una llamada o visita guiada a los lotes.
- Cuando el usuario exprese interés en ver precios, agendar visita o comprar, solicita amablemente su Nombre y Número de WhatsApp para que un asesor especializado se contacte.
`;

module.exports = async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, message, history, lead } = req.body || {};

        // ACCIÓN 1: Procesar Conversación IA
        if (action === 'chat') {
            if (!message || typeof message !== 'string') {
                return res.status(400).json({ error: 'Mensaje requerido' });
            }

            const aiResponse = await generateAIResponse(message, history || []);
            return res.status(200).json({ success: true, reply: aiResponse });
        }

        // ACCIÓN 2: Registrar Lead y Notificar (Telegram + Correo + Supabase)
        if (action === 'lead') {
            const { nombre, telefono, email, interes, resumenChat } = lead || {};

            if (!nombre || !telefono) {
                return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
            }

            const leadNombre = String(nombre).trim();
            const leadTelefono = String(telefono).trim();
            const leadEmail = email ? String(email).trim() : 'No indicado';
            const leadInteres = interes ? String(interes).trim() : 'Consulta Vía IA Chatbot';

            // 1. Guardar en Supabase (Tabla: clientes)
            const { error: dbError } = await supabase
                .from('clientes')
                .insert([
                    {
                        nombre_completo: leadNombre,
                        telefono: leadTelefono,
                        email: leadEmail,
                        estado_lead: 'Nuevo',
                        origen: 'Norte Chico (IA)',
                        tipo_interes: leadInteres,
                        fecha_registro: new Date().toISOString().split('T')[0]
                    }
                ]);

            if (dbError) {
                console.error("Error guardando lead en Supabase desde IA:", dbError);
            }

            // 2. Enviar Alerta Instantánea a Telegram
            if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                const mensajeTelegram = [
                    '🤖 *NUEVO LEAD DESDE ASISTENTE IA* 🤖',
                    '',
                    `👤 *Nombre:* ${leadNombre}`,
                    `📱 *Teléfono:* ${leadTelefono}`,
                    `📧 *Email:* ${leadEmail}`,
                    `🎯 *Interés:* ${leadInteres}`,
                    `🌐 *Origen:* Landing Web (Chatbot IA)`,
                    resumenChat ? `💬 *Resumen:* _${resumenChat.substring(0, 150)}..._` : '',
                    '',
                    '👉 Contactar al prospecto de inmediato.'
                ].filter(Boolean).join('\n');

                try {
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: TELEGRAM_CHAT_ID,
                            text: mensajeTelegram,
                            parse_mode: 'Markdown'
                        })
                    });
                } catch (tgErr) {
                    console.error("Error enviando notificación a Telegram:", tgErr);
                }
            }

            // 3. Enviar Notificación por Correo Electrónico (Resend API o Webhook Email)
            if (RESEND_API_KEY) {
                try {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${RESEND_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: 'Norte Chico IA <noreply@banka.cl>',
                            to: [NOTIFICATION_EMAIL],
                            subject: `🚨 Nuevo Lead IA: ${leadNombre} (${leadTelefono})`,
                            html: `
                                <h2>🚨 Nuevo Prospecto Registrado vía Asistente IA</h2>
                                <p><strong>Nombre:</strong> ${leadNombre}</p>
                                <p><strong>Teléfono:</strong> <a href="tel:${leadTelefono}">${leadTelefono}</a></p>
                                <p><strong>Email:</strong> ${leadEmail}</p>
                                <p><strong>Interés:</strong> ${leadInteres}</p>
                                <p><strong>Canal:</strong> Landing Web (Asistente IA Norte Chico)</p>
                                <hr>
                                <p><em>Revisa el Dashboard de Administración para más detalles.</em></p>
                            `
                        })
                    });
                } catch (emailErr) {
                    console.error("Error enviando email via Resend:", emailErr);
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Lead registrado y notificado exitosamente'
            });
        }

        return res.status(400).json({ error: 'Acción no válida' });

    } catch (err) {
        console.error("Error procesando api/chat.js:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ================= GENERADOR DE RESPUESTAS IA =================
async function generateAIResponse(userMessage, history = []) {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    // 1. Integración con Gemini API de Google (si está la API Key en Vercel)
    if (GEMINI_KEY) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: SYSTEM_KNOWLEDGE }] },
                        ...history.slice(-6).map(h => ({
                            role: h.role === 'user' ? 'user' : 'model',
                            parts: [{ text: h.content }]
                        })),
                        { role: 'user', parts: [{ text: userMessage }] }
                    ]
                })
            });
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
        } catch (e) {
            console.warn("Fallo en Gemini API, pasando a motor alternativo:", e);
        }
    }

    // 2. Integración con OpenAI API (si está la API Key en Vercel)
    if (OPENAI_KEY) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_KNOWLEDGE },
                        ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 250
                })
            });
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) return text.trim();
        } catch (e) {
            console.warn("Fallo en OpenAI API, pasando a motor alternativo:", e);
        }
    }

    // 3. Motor Inteligente Especializado en Inmuebles Norte Chico (fallback inmediato sin latencia)
    return getBuiltInInmobiliariaReply(userMessage);
}

function getBuiltInInmobiliariaReply(msg) {
    const text = msg.toLowerCase();

    if (text.includes('precio') || text.includes('cuanto') || text.includes('costo') || text.includes('valor')) {
        return "🏡 Nuestros lotes residenciales en Huaral van desde $15,000 USD. Contamos con crédito directo sin intereses dando solo el 20% de inicial. ¿Te gustaría que te enviemos la lista de precios actualizada a tu WhatsApp?";
    }

    if (text.includes('ubicac') || text.includes('donde') || text.includes('queda') || text.includes('llegar')) {
        return "📍 Nos encontramos en Huaral, la capital de la agricultura en el Norte Chico de Lima (a solo 1h 15m de Lima por la Panamericana Norte). Un clima soleado espectacular todo el año. ¿Quieres coordinar una visita guiada?";
    }

    if (text.includes('visita') || text.includes('ir') || text.includes('agenda') || text.includes('conocer') || text.includes('ver')) {
        return "📅 ¡Excelente! Organizamos visitas guiadas presenciales los fines de semana. Por favor déjame tu **Nombre y Teléfono** en el formulario del chat para agendar tu transporte y atención VIP.";
    }

    if (text.includes('financ') || text.includes('cuota') || text.includes('inicial') || text.includes('credito') || text.includes('pago')) {
        return "💳 ¡Ofrecemos Financiamiento Directo! Separas con una cuota inicial mínima del 20% y el saldo lo pagas hasta en 36 meses sin intereses ni trámites bancarios. ¿Deseas recibir una simulación de cuotas?";
    }

    if (text.includes('titulo') || text.includes('sunarp') || text.includes('document') || text.includes('papel') || text.includes('propiedad')) {
        return "📜 ¡Total seguridad jurídica! Todos los proyectos están independizados en SUNARP, listos para firma en notaría y escritura pública. ¿Te gustaría dejar tu número para enviarte la partida registral?";
    }

    if (text.includes('hola') || text.includes('buenas') || text.includes('saludos') || text.includes('informacion')) {
        return "¡Hola! 👋 Bienvenido a Inmobiliaria Norte Chico. Soy tu asistente virtual. ¿Te interesa conocer nuestros lotes en Huaral, agendar una visita o consultar facilidades de pago?";
    }

    return "🏡 Gracias por consultar. En Norte Chico ofrecemos terrenos independizados en SUNARP desde $15,000 USD con crédito directo en Huaral. Para brindarte información detallada, ¿podrías dejarme tu Nombre y Número de WhatsApp?";
}
