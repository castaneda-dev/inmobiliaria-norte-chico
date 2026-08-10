import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, email, telefono, prefijo, mensaje } = body;

    if (!nombre || (!email && !telefono)) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const fullPhone = `${prefijo || '+51'} ${telefono || ''}`.trim();

    // Insertar en la base de datos de Supabase de forma segura en el servidor
    const { data, error } = await supabase.from('clientes').insert([{
      nombre_completo: nombre,
      email: email,
      telefono: fullPhone,
      tipo_interes: mensaje,
      estado_lead: 'Nuevo',
      origen: 'Web Next.js (Production Mode)'
    }]);

    if (error) {
      console.error("Error inserting contact lead via API:", error);
      return NextResponse.json({ success: false, error: 'Error interno al guardar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /contact error:", error);
    return NextResponse.json({ success: false, error: 'Error procesando solicitud' }, { status: 500 });
  }
}
