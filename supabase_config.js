// ================= SUPABASE CLIENT CONFIGURATION =================
// Reemplaza estas dos constantes con tus claves de tu proyecto en Supabase (https://supabase.com)

const SUPABASE_URL = "https://jlgnqiedkagkcqoakmom.supabase.co"; // Ej: "https://xyzcompany.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZ25xaWVka2Fna2Nxb2FrbW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDg2NjQsImV4cCI6MjEwMTI4NDY2NH0.vjTSpZ3gJO_iE0SKrSJczoND0DP-9tK7y3Hzr2n0eaE"; // Ej: "eyJhbGciOiJIUzI1NiIsIn..."

// Inicializador del cliente Supabase
let supabaseClient = null;

if (typeof supabase !== 'undefined' && SUPABASE_URL !== "TU_SUPABASE_URL_AQUI") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Cliente de Supabase conectado en tiempo real.");
} else {
    console.log("ℹ️ ModoSoloDemo: Supabase no configurado aún, utilizando almacenamiento local.");
}
