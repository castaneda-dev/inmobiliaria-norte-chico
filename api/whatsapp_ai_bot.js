// ==============================================================================
// WHATSAPP IA WEBHOOK (META CLOUD API + OPENAI + SUPABASE)
// Ruta Vercel Serverless: /api/whatsapp_ai_bot
// ==============================================================================

export default async function handler(req, res) {
    // Verificación de Webhook para Meta (Facebook Cloud API)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        
        // Verifica si el token coincide con el configurado en Vercel Env Vars
        if (mode && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        } else {
            return res.status(403).json({ error: 'Invalid verification token' });
        }
    }

    // Recepción de mensajes (POST)
    if (req.method === 'POST') {
        try {
            const body = req.body;

            // Meta Cloud API manda los mensajes entrantes en este formato anidado
            if (body.object === 'whatsapp_business_account') {
                for (let entry of body.entry) {
                    for (let change of entry.changes) {
                        const messageData = change.value.messages;
                        if (messageData && messageData[0]) {
                            const message = messageData[0];
                            const senderPhone = message.from;
                            const textBody = message.text?.body || '';

                            console.log(`[WHATSAPP IA] Mensaje recibido de ${senderPhone}: ${textBody}`);

                            // Aquí es donde irá el CORE de la IA.
                            // Pasos arquitectónicos dejados listos:
                            // 1. Extraer la intención del usuario ("busco lote", "precio", "chancay").
                            // 2. Fetch a Supabase REST API buscando propiedades coincidentes.
                            // 3. Prompt a OpenAI ChatCompletion (RAG): "Eres asesor, responde con estos lotes...".
                            // 4. Send Message via Meta WhatsApp API (fetch a graph.facebook.com/.../messages).

                            // Para efectos de infraestructura inicial, registramos el hito y devolvemos 200 OK.
                            // (Meta exige devolver 200 rápido para no reenviar el webhook).
                        }
                    }
                }
                return res.status(200).send('EVENT_RECEIVED');
            } else {
                return res.status(404).send('NOT_FOUND');
            }
        } catch (error) {
            console.error('Error procesando Webhook de WhatsApp:', error);
            return res.status(500).send('SERVER_ERROR');
        }
    }
    
    return res.status(405).send('METHOD_NOT_ALLOWED');
}
