import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { event_name, event_time, user_data, custom_data } = body;

    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("⚠️ Meta CAPI: Faltan variables de entorno (META_PIXEL_ID, META_CAPI_TOKEN). Evento ignorado temporalmente.");
      return NextResponse.json({ success: true, message: 'CAPI simulation mode (Keys missing)' }, { status: 200 });
    }

    const payload = {
      data: [
        {
          event_name: event_name || 'Lead',
          event_time: event_time || Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: {
            em: user_data?.email_hash ? [user_data.email_hash] : [],
            ph: user_data?.phone_hash ? [user_data.phone_hash] : [],
          },
          custom_data: custom_data || {}
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Meta CAPI Error:", data.error);
      return NextResponse.json({ error: 'Meta CAPI Request Failed', details: data.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, meta_response: data }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error (Meta CAPI):", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
