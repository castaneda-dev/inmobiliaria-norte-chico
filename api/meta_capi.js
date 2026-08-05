// ==============================================================================
// META CONVERSIONS API (CAPI) WEBHOOK
// Ruta Vercel Serverless: /api/meta_capi
// ==============================================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { event_name, event_time, user_data, custom_data } = req.body;
        
        // Variables de Entorno (Deben configurarse en el panel de Vercel)
        const PIXEL_ID = process.env.META_PIXEL_ID;
        const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

        // Si las llaves no están configuradas aún, simulamos éxito para no romper el frontend
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.warn("⚠️ Meta CAPI: Faltan variables de entorno (META_PIXEL_ID, META_CAPI_TOKEN). Evento ignorado temporalmente.");
            return res.status(200).json({ success: true, message: 'CAPI simulation mode (Keys missing)' });
        }

        // Payload estructurado según la documentación de Meta Graph API
        const payload = {
            data: [
                {
                    event_name: event_name || 'Lead',
                    event_time: event_time || Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    user_data: {
                        // Meta requiere que los datos PII estén hasheados en SHA256, 
                        // pero la Graph API a veces acepta raw si se indica, o el frontend debe hashearlo.
                        // Para simplificar, pasamos los datos del cliente asumiendo que vienen limpios.
                        em: [user_data.email_hash], // SHA256 email
                        ph: [user_data.phone_hash], // SHA256 phone
                    },
                    custom_data: custom_data || {}
                }
            ]
        };

        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Meta CAPI Error:", data.error);
            return res.status(500).json({ error: 'Meta CAPI Request Failed', details: data.error });
        }

        return res.status(200).json({ success: true, meta_response: data });
    } catch (error) {
        console.error("Internal Server Error (Meta CAPI):", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
