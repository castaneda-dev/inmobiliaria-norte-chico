import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase usando variables de entorno (seguridad)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Variables de Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req, res) {
    // Solo aceptamos peticiones POST (Webhooks)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log("Webhook recibido:", payload);

        // EXTRAER DATOS DEL LEAD
        // Esto asume un formato genérico que podemos ajustar. 
        // Normalmente FB manda los datos en un array dentro de 'field_data'
        
        let nombre = 'Lead Desconocido';
        let telefono = 'No indicado';
        let email = 'No indicado';

        // Intentar parsear el formato estándar de webhook simple:
        if (payload.nombre || payload.name || payload.full_name) {
            nombre = payload.nombre || payload.name || payload.full_name;
        }
        if (payload.telefono || payload.phone || payload.phone_number) {
            telefono = payload.telefono || payload.phone || payload.phone_number;
        }
        if (payload.email || payload.correo) {
            email = payload.email || payload.correo;
        }

        // GUARDAR EN SUPABASE (Tabla: Clientes)
        const { data, error } = await supabase
            .from('Clientes')
            .insert([
                { 
                    nombre_completo: nombre, 
                    telefono: telefono, 
                    email: email,
                    estado_lead: 'Nuevo'
                }
            ]);

        if (error) {
            console.error("Error al guardar en Supabase:", error);
            throw error;
        }

        // ENVIAR MENSAJE A TELEGRAM
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const mensaje = `🚨 *NUEVO LEAD RECIBIDO* 🚨\n\n👤 *Nombre:* ${nombre}\n📱 *Teléfono:* ${telefono}\n📧 *Email:* ${email}\n\n👉 Revisa el Dashboard Inmobiliario para más detalles.`;
            
            const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
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
}
