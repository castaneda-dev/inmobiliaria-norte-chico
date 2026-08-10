import { createClient } from '@supabase/supabase-js';

const getCleanEnv = (val) => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = 
  getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || 
  getCleanEnv(process.env.SUPABASE_URL);

const supabaseAnonKey = 
  getCleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 
  getCleanEnv(process.env.SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables missing! Please check .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
