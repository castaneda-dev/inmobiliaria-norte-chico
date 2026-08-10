const { createClient } = require('@supabase/supabase-js');

// Inicializar Supabase usando variables de entorno (seguridad)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Variables de Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Sanitización y Validación básica de campos
function sanitizeField(val, fallback = 'No indicado') {
    if (!val || typeof val !== 'string') return fallback;
    const clean = val.trim().replace(/[<>/]/g, '');
    return clean.length > 0 ? clean : fallback;
}

function sanitizeEmail(val) {
    if (!val || typeof val !== 'string') return 'No indicado';
    const email = val.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : 'No indicado';
}

function sanitizePhone(val) {
    if (!val || typeof val !== 'string') return 'No indicado';
    const phone = val.trim().replace(/[^\d+()\s-]/g, '');
    return phone.length >= 6 ? phone : 'No indicado';
}

// Envío resiliente con reintentos para Telegram
async function sendTelegramAlertWithRetry(mensaje, maxRetries = 3) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: mensaje,
                    parse_mode: 'Markdown'
                })
            });
            if (response.ok) {
                console.log(`✅ Notificación enviada a Telegram en el intento ${attempt}.`);
                return true;
            }
            console.warn(`⚠️ Telegram API respondió estado ${response.status} en intento ${attempt}.`);
        } catch (err) {
            console.warn(`⚠️ Error conectando con Telegram API (intento ${attempt}/${maxRetries}):`, err.message);
        }
        if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, attempt * 1000));
        }
    }
    return false;
}

const crypto = require('crypto');

module.exports = async function handler(req, res) {
    // Solo aceptamos peticiones POST (Webhooks)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const signature = req.headers['x-hub-signature-256'];
        const fbAppSecret = process.env.FACEBOOK_APP_SECRET;

        if (fbAppSecret && signature) {
            const rawBody = JSON.stringify(req.body);
            const hmac = crypto.createHmac('sha256', fbAppSecret);
            const digest = `sha256=${hmac.update(rawBody).digest('hex')}`;
            if (signature !== digest) {
                console.warn("⚠️ Meta Webhook: Invalid HMAC Signature detected.");
                return res.status(401).json({ error: 'Invalid Signature' });
            }
        } else if (!fbAppSecret && signature) {
            console.warn("⚠️ Meta Webhook: Signature present but FACEBOOK_APP_SECRET missing. Simulating success...");
        }
        const payload = req.body || {};
        console.log("Webhook recibido:", JSON.stringify(payload));

        let rawNombre = 'Lead Desconocido';
        let rawTelefono = 'No indicado';
        let rawEmail = 'No indicado';
        let origen = 'Webhook';
        let rawTipoInteres = 'Consulta General';

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
                        rawNombre = val;
                    } else if (key.includes('phone') || key.includes('telefono') || key.includes('tel')) {
                        rawTelefono = val;
                    } else if (key.includes('email') || key.includes('correo')) {
                        rawEmail = val;
                    } else if (key.includes('interes') || key.includes('busca') || key.includes('objetivo')) {
                        rawTipoInteres = val;
                    }
                });
            } catch (fbErr) {
                console.warn("Error parseando formato Facebook:", fbErr);
            }
        }
        // --- Formato 2: TikTok Ads ---
        else if (payload.leads && Array.isArray(payload.leads)) {
            origen = 'TikTok Ads';
            try {
                const lead = payload.leads[0];
                rawNombre = lead.name || lead.full_name || rawNombre;
                rawTelefono = lead.phone_number || lead.phone || rawTelefono;
                rawEmail = lead.email || rawEmail;
            } catch (ttErr) {
                console.warn("Error parseando formato TikTok:", ttErr);
            }
        }
        // --- Formato 3: Genérico (JSON plano) ---
        else {
            if (payload.nombre || payload.name || payload.full_name) {
                rawNombre = payload.nombre || payload.name || payload.full_name;
            }
            if (payload.telefono || payload.phone || payload.phone_number) {
                rawTelefono = payload.telefono || payload.phone || payload.phone_number;
            }
            if (payload.email || payload.correo) {
                rawEmail = payload.email || payload.correo;
            }
            if (payload.origen || payload.source) {
                origen = payload.origen || payload.source;
            }
            if (payload.tipo_interes || payload.interes || payload.interest) {
                rawTipoInteres = payload.tipo_interes || payload.interes || payload.interest;
            }
        }

        // Sanitizar datos antes de guardar
        const nombre = sanitizeField(rawNombre, 'Lead Desconocido');
        const telefono = sanitizePhone(rawTelefono);
        const email = sanitizeEmail(rawEmail);
        const tipoInteres = sanitizeField(rawTipoInteres, 'Consulta General');

        // GUARDAR EN SUPABASE (Tabla: clientes)
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

        // ENVIAR NOTIFICACIÓN CON REINTENTOS A TELEGRAM
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

        await sendTelegramAlertWithRetry(mensaje, 3);

        return res.status(200).json({ success: true, message: 'Lead procesado correctamente' });

    } catch (error) {
        console.error("Error procesando el webhook:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};
