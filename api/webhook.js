const { createClient } = require('@supabase/supabase-js');

// Inicializar Supabase usando variables de entorno (seguridad)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Variables de Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

module.exports = async function handler(req, res) {
    // Solo aceptamos peticiones POST (Webhooks)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log("Webhook recibido:", JSON.stringify(payload));

        // EXTRAER DATOS DEL LEAD
        // Soporta formato genérico Y formato de Facebook Lead Ads
        let nombre = 'Lead Desconocido';
        let telefono = 'No indicado';
        let email = 'No indicado';
        let origen = 'Webhook';
        let tipoInteres = 'Consulta General';

        // --- Formato 1: Facebook Lead Ads (field_data array) ---
        if (payload.entry && Array.isArray(payload.entry)) {
            origen = 'Facebook Ads';
            try {
                const leadgenEntry = payload.entry[0];
                const changes = leadgenEntry?.changes?.[0];
                const fieldData = changes?.value?.field_data || [];

                fieldData.forEach(field => {
                    const key = (field.name || '').toLowerCase();
                    const val = Array.isArray(field.values) ? field.values[0] : '';

                    if (key.includes('name') || key.includes('nombre') || key.includes('full_name')) {
                        nombre = val;
                    } else if (key.includes('phone') || key.includes('telefono') || key.includes('tel')) {
                        telefono = val;
                    } else if (key.includes('email') || key.includes('correo')) {
                        email = val;
                    } else if (key.includes('interes') || key.includes('busca') || key.includes('objetivo')) {
                        tipoInteres = val;
                    }
                });
            } catch (fbErr) {
                console.warn("Error parseando formato Facebook:", fbErr);
            }
        }
        // --- Formato 2: TikTok Ads (similar a genérico) ---
        else if (payload.leads && Array.isArray(payload.leads)) {
            origen = 'TikTok Ads';
            try {
                const lead = payload.leads[0];
                nombre = lead.name || lead.full_name || nombre;
                telefono = lead.phone_number || lead.phone || telefono;
                email = lead.email || email;
            } catch (ttErr) {
                console.warn("Error parseando formato TikTok:", ttErr);
            }
        }
        // --- Formato 3: Genérico (JSON plano) ---
        else {
            if (payload.nombre || payload.name || payload.full_name) {
                nombre = payload.nombre || payload.name || payload.full_name;
            }
            if (payload.telefono || payload.phone || payload.phone_number) {
                telefono = payload.telefono || payload.phone || payload.phone_number;
            }
            if (payload.email || payload.correo) {
                email = payload.email || payload.correo;
            }
            if (payload.origen || payload.source) {
                origen = payload.origen || payload.source;
            }
            if (payload.tipo_interes || payload.interes || payload.interest) {
                tipoInteres = payload.tipo_interes || payload.interes || payload.interest;
            }
        }

        // GUARDAR EN SUPABASE (Tabla: clientes — minúscula)
        const { data, error } = await supabase
            .from('clientes')
            .insert([
                {
                    nombre_completo: nombre,
                    telefono: telefono,
                    email: email,
                    estado_lead: 'Nuevo',
                    origen: origen,
                    tipo_interes: tipoInteres,
                    fecha_registro: new Date().toISOString().split('T')[0]
                }
            ]);

        if (error) {
            console.error("Error al guardar en Supabase:", error);
            throw error;
        }

        // ENVIAR MENSAJE A TELEGRAM
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const mensaje = [
                '🚨 *NUEVO LEAD RECIBIDO* 🚨',
                '',
                '👤 *Nombre:* ' + nombre,
                '📱 *Telefono:* ' + telefono,
                '📧 *Email:* ' + email,
                '📣 *Origen:* ' + origen,
                '🎯 *Interes:* ' + tipoInteres,
                '',
                '👉 Revisa el Dashboard para mas detalles.'
            ].join('\n');

            const telegramUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
            await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: mensaje,
                    parse_mode: 'Markdown'
                })
            });
        }

        // Responder con éxito para que FB/TikTok no reintente
        return res.status(200).json({ success: true, message: 'Lead procesado correctamente' });

    } catch (error) {
        console.error("Error procesando el webhook:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
