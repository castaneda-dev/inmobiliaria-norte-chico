import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jlgnqiedkagkcqoakmom.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZ25xaWVka2Fna2Nxb2FrbW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDg2NjQsImV4cCI6MjEwMTI4NDY2NH0.vjTSpZ3gJO_iE0SKrSJczoND0DP-9tK7y3Hzr2n0eaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
