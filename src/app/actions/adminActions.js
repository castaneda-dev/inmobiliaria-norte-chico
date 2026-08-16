'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Esquema de validación estricto para propiedades
const propertySchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(150),
  precio: z.number().nonnegative("El precio no puede ser negativo"),
  area_m2: z.number().positive("El área debe ser mayor a 0"),
  tipo_activo: z.string().min(1, "El tipo de activo es requerido"),
  zonificacion: z.string().min(1, "La zonificación es requerida"),
  imagen_url: z.string().url("URL de imagen inválida").or(z.string().startsWith('/')),
  descripcion: z.string().optional().default(""),
  estado: z.string().default("Disponible"),
  ubicacion: z.string().default("Chancay"),
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional()
});

const getCleanEnv = (val) => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || getCleanEnv(process.env.SUPABASE_URL);
const supabaseKey = getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || getCleanEnv(process.env.SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Inicializa un cliente de Supabase instanciado extrayendo el token de las cookies o parámetro
function getAuthClient(clientToken = null) {
  const cookieStore = cookies();
  const token = clientToken || cookieStore.get('sb-access-token')?.value;

  if (token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function savePropertyAction(propertyData, isEditing = false, propertyId = null) {
  const supabase = getAuthClient();
  
  if (!supabase) {
    return { success: false, error: "No estás autenticado o tu sesión ha expirado." };
  }
  
  try {
    // 1. Validación de payload con Zod
    const validatedData = propertySchema.parse(propertyData);

    let result;
    if (isEditing && propertyId) {
      result = await supabase
        .from('propiedades')
        .update(validatedData)
        .eq('id', propertyId);
    } else {
      result = await supabase
        .from('propiedades')
        .insert([validatedData]);
    }

    if (result.error) throw result.error;

    // 2. Revalida la ruta principal y las landings para actualizar los datos al instante
    revalidatePath('/');
    revalidatePath('/inmobiliaria-en-chancay');
    revalidatePath('/inmobiliaria-en-huaral');
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error saving property:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      return { success: false, error: `Validación fallida: ${errorMessage}` };
    }
    return { success: false, error: error.message || 'Error interno del servidor.' };
  }
}

export async function deletePropertyAction(propertyId) {
  const supabase = getAuthClient();
  
  if (!supabase) {
    return { success: false, error: "No estás autenticado o tu sesión ha expirado." };
  }
  
  try {
    // Validación sencilla de input
    if (!propertyId) throw new Error("ID de propiedad inválido.");

    const { error } = await supabase
      .from('propiedades')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;

    // Revalida la ruta principal y landings
    revalidatePath('/');
    revalidatePath('/inmobiliaria-en-chancay');
    revalidatePath('/inmobiliaria-en-huaral');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, error: error.message || 'Error interno del servidor.' };
  }
}

// Esquema de validación estricto para artículos del blog
const articleSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres").max(200),
  categoria: z.string().min(1, "La categoría es requerida"),
  resumen: z.string().min(10, "El resumen debe tener al menos 10 caracteres"),
  contenido: z.any().optional(),
  puntos_clave: z.any().optional(),
  autor: z.string().default("Equipo Norte Chico"),
  autor_rol: z.string().default("Comité Editorial"),
  imagen_url: z.string().url("URL de imagen inválida").or(z.string().startsWith('/')),
  tiempo_lectura: z.string().default("4 min de lectura"),
  destacado: z.boolean().default(false),
  publicado: z.boolean().default(true),
  badge_color: z.string().default("#cb9f74")
});

export async function saveArticleAction(articleData, isEditing = false, articleId = null, clientToken = null) {
  const supabase = getAuthClient(clientToken);
  
  try {
    const validatedData = articleSchema.parse(articleData);

    let result;
    if (isEditing && articleId) {
      result = await supabase
        .from('articulos')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);
    } else {
      result = await supabase
        .from('articulos')
        .insert([{
          ...validatedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
    }

    if (result.error) throw result.error;

    // Revalidar las rutas públicas del blog y sitemap
    revalidatePath('/blog');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/sitemap.xml');
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error saving article:", error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      return { success: false, error: `Validación fallida: ${errorMessage}` };
    }
    return { success: false, error: error.message || 'Error interno del servidor.' };
  }
}

export async function deleteArticleAction(articleId, clientToken = null) {
  const supabase = getAuthClient(clientToken);
  
  try {
    if (!articleId) throw new Error("ID de artículo inválido.");

    const { error } = await supabase
      .from('articulos')
      .delete()
      .eq('id', articleId);

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/sitemap.xml');
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: error.message || 'Error interno del servidor.' };
  }
}

