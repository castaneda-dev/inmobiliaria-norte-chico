'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getCleanEnv = (val) => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = 
  getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || 
  getCleanEnv(process.env.SUPABASE_URL) ||
  'https://jlgnqiedkagkcqoakmom.supabase.co';

const supabaseKey = 
  getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  getCleanEnv(process.env.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZ25xaWVka2Fna2Nxb2FrbW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDg2NjQsImV4cCI6MjEwMTI4NDY2NH0.vjTSpZ3gJO_iE0SKrSJczoND0DP-9tK7y3Hzr2n0eaE';

// Inicializa un cliente de Supabase instanciado por solicitud para asegurar la sesión
function getAuthClient(token) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function savePropertyAction(token, propertyData, isEditing = false, propertyId = null) {
  if (!token) throw new Error("No estás autenticado.");
  
  const supabase = getAuthClient(token);
  
  try {
    let result;
    if (isEditing && propertyId) {
      result = await supabase
        .from('propiedades')
        .update(propertyData)
        .eq('id', propertyId);
    } else {
      result = await supabase
        .from('propiedades')
        .insert([propertyData]);
    }

    if (result.error) throw result.error;

    // Revalida la ruta principal para actualizar los datos estáticos al instante
    revalidatePath('/');
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error saving property:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePropertyAction(token, propertyId) {
  if (!token) throw new Error("No estás autenticado.");
  
  const supabase = getAuthClient(token);
  
  try {
    const { error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;

    // Revalida la ruta principal
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: error.message };
  }
}
