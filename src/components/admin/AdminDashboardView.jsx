"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import { savePropertyAction, deletePropertyAction } from '../../app/actions/adminActions';
import { 
  Building2, Users, TrendingUp, ShieldCheck, Plus, Trash2, Edit3, 
  Search, LogOut, Lock, ArrowLeft, RefreshCw, CheckCircle, MessageSquare, PhoneCall,
  Eye, EyeOff
} from 'lucide-react';

const normalizeImageUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'string' && url.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) {
      return url;
    }
  }
  return url;
};

export default function AdminDashboardView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis' | 'propiedades' | 'clientes'

  // Supabase Data States
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Form States
  const [showPropModal, setShowPropModal] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [propForm, setPropForm] = useState({
    titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible', ubicacion: '', latitud: '', longitud: ''
  });

  // Check active Supabase Auth session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setIsAuthenticated(true);
          setSessionToken(data.session.access_token);
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    }
    checkSession();

    // Sincronizar sesión con cookies para el Middleware
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${session.expires_in}; secure; samesite=lax`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Supabase Auth Login with Email & Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setIsAuthenticated(true);
        setSessionToken(data.session.access_token);
      }
    } catch (err) {
      setAuthError(err.message || 'Correo o contraseña incorrectos');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setIsAuthenticated(false);
  };

  // Fetch Supabase Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [propRes, clientRes] = await Promise.all([
        supabase.from('propiedades').select('*').order('id', { ascending: false }),
        supabase.from('clientes').select('*').order('id', { ascending: false })
      ]);

      if (propRes.data) setProperties(propRes.data);
      if (clientRes.data) setClients(clientRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // CRUD Operations: Property
  const handleSaveProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        titulo: propForm.titulo,
        precio: parseFloat(propForm.precio) || 0,
        area_m2: parseFloat(propForm.area_m2) || 0,
        tipo_activo: propForm.tipo_activo,
        zonificacion: propForm.zonificacion,
        imagen_url: propForm.imagen_url || '/PR_GLORIETA_DELUXE.webp',
        descripcion: propForm.descripcion,
        estado: propForm.estado,
        ubicacion: propForm.ubicacion || 'Chancay',
        latitud: propForm.latitud ? parseFloat(propForm.latitud) : null,
        longitud: propForm.longitud ? parseFloat(propForm.longitud) : null
      };

      const result = await savePropertyAction(sessionToken, payload, !!editingProp, editingProp?.id);
      
      if (!result.success) throw new Error(result.error);

      setShowPropModal(false);
      setEditingProp(null);
      setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible', ubicacion: '', latitud: '', longitud: '' });
      fetchData();
    } catch (err) {
      console.error("Internal error saving property:", err);
      alert("Hubo un error al guardar la propiedad: " + (err.message || err) + ". Por favor, intente nuevamente.");
    }
  };

  const [customUrlInput, setCustomUrlInput] = useState('');

  const getImagesList = (rawUrl) => {
    if (!rawUrl) return [];
    if (Array.isArray(rawUrl)) return rawUrl;
    try {
      if (typeof rawUrl === 'string' && rawUrl.trim().startsWith('[')) {
        const parsed = JSON.parse(rawUrl);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [rawUrl];
  };

  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        alert(`El archivo ${f.name} no es un formato permitido (solo JPG, PNG o WebP).`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        alert(`El archivo ${f.name} supera los 10 MB permitidos.`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('propiedades')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Error al subir ${file.name}:`, uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('propiedades')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setPropForm(prev => {
          const currentList = getImagesList(prev.imagen_url);
          const combined = [...currentList, ...uploadedUrls];
          return {
            ...prev,
            imagen_url: JSON.stringify(combined)
          };
        });
      }
    } catch (error) {
      console.error("Internal error uploading multi images:", error);
      alert(`Hubo un error al subir las imágenes: ${error.message || 'Error desconocido'}. Intente nuevamente.`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setPropForm(prev => {
      const currentList = getImagesList(prev.imagen_url);
      const combined = [...currentList, trimmed];
      return {
        ...prev,
        imagen_url: JSON.stringify(combined)
      };
    });
    setCustomUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setPropForm(prev => {
      const currentList = getImagesList(prev.imagen_url);
      const updated = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        imagen_url: updated.length > 0 ? JSON.stringify(updated) : ''
      };
    });
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm("¿Seguro de eliminar este proyecto del catálogo?")) return;
    try {
      const result = await deletePropertyAction(sessionToken, id);
      if (!result.success) throw new Error(result.error);
      fetchData();
    } catch (err) {
      console.error("Internal error deleting property:", err);
      alert("Hubo un error al eliminar. Por favor, intente nuevamente.");
    }
  };

  const handleUpdatePropStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('propiedades').update({ estado: status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRM Operation: Update Client Status
  const handleUpdateClientStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('clientes').update({ estado_lead: status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <main className="bg-arena min-h-screen text-asfalto flex items-center justify-center px-4">
        <div className="bg-white border border-terracota/30 rounded-xl p-10 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-terracota/10 border border-terracota/30 rounded-full flex items-center justify-center mx-auto mb-6 text-terracota">
            <Lock size={32} />
          </div>

          <h1 className="font-sans font-black text-2xl text-asfalto mb-2">Panel Administrativo</h1>
          <p className="font-mono text-xs opacity-60 mb-8">Inmobiliaria Norte Chico S.A.C.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left font-mono text-xs">
            <div>
              <label className="block text-terracota font-bold mb-1 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@inmobiliarianortechico.pe"
                className="w-full bg-arena/30 border border-asfalto/20 rounded-xl px-4 py-3.5 text-asfalto focus:outline-none focus:border-terracota"
                required
              />
            </div>
            <div>
              <label className="block text-terracota font-bold mb-1 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-arena/30 border border-asfalto/20 rounded-xl pl-4 pr-12 py-3.5 text-asfalto focus:outline-none focus:border-terracota"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-asfalto hover:text-terracota focus:outline-none opacity-60 hover:opacity-100 transition-opacity"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {authError && <div className="text-red-500 text-center font-mono text-xs mt-1">{authError}</div>}
            <button 
              type="submit"
              className="mt-2 bg-terracota text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#a64b2b] transition-colors shadow-lg"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-asfalto/10">
            <Link href="/" className="font-mono text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Volver a la Web Pública
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const filteredProps = properties.filter(p => p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(c => c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.telefono?.includes(searchTerm));

  return (
    <main className="bg-arena text-asfalto min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-asfalto/10 bg-white sticky top-0 z-40 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-sans font-black text-xl text-asfalto tracking-tight">
            INMOBILIARIA NORTE CHICO
          </Link>
          <span className="bg-terracota/10 border border-terracota/30 text-terracota px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase">
            Dashboard Admin
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={fetchData} className="font-mono text-xs opacity-70 hover:opacity-100 flex items-center gap-2 text-asfalto" title="Recargar Datos">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button onClick={handleLogout} className="bg-asfalto/5 hover:bg-red-50 text-asfalto hover:text-red-500 px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 transition-colors border border-asfalto/10">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-[90rem] mx-auto px-8 py-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-asfalto/10 pb-6">
          <div className="flex gap-3 font-mono text-xs">
            <button 
              onClick={() => setActiveTab('kpis')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'kpis' ? 'bg-terracota text-white shadow-lg' : 'bg-white/60 text-asfalto/70 hover:bg-white'}`}
            >
              📊 Resumen KPIs
            </button>
            <button 
              onClick={() => setActiveTab('propiedades')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'propiedades' ? 'bg-terracota text-white shadow-lg' : 'bg-white/60 text-asfalto/70 hover:bg-white'}`}
            >
              🏠 Propiedades ({properties.length})
            </button>
            <button 
              onClick={() => setActiveTab('clientes')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'clientes' ? 'bg-terracota text-white shadow-lg' : 'bg-white/60 text-asfalto/70 hover:bg-white'}`}
            >
              👥 Leads CRM ({clients.length})
            </button>
          </div>

          <div className="w-full md:w-72 relative">
            <Search size={16} className="absolute left-4 top-3.5 opacity-40 text-asfalto" />
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-asfalto/20 rounded-full pl-10 pr-4 py-2.5 text-xs text-asfalto placeholder:text-asfalto/40 focus:outline-none focus:border-terracota shadow-sm"
            />
          </div>
        </div>

        {/* TAB 1: KPIs RESUMEN */}
        {activeTab === 'kpis' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-asfalto border border-arena/10 rounded-3xl p-6 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-70 uppercase text-arena">Total Propiedades</span>
                  <Building2 className="text-terracota" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">{properties.length}</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-2">Disponibles en Catálogo</div>
              </div>

              <div className="bg-asfalto border border-arena/10 rounded-3xl p-6 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-70 uppercase text-arena">Leads Capturados</span>
                  <Users className="text-terracota" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">{clients.length}</div>
                <div className="font-mono text-[10px] text-terracota mt-2">Clientes Registrados CRM</div>
              </div>

              <div className="bg-asfalto border border-arena/10 rounded-3xl p-6 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-70 uppercase text-arena">Tasa de Conversión</span>
                  <TrendingUp className="text-emerald-400" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-emerald-400">
                  {clients.length > 0 ? ((clients.filter(c => c.estado === 'Ganado' || c.estado === 'Contactado').length / clients.length) * 100).toFixed(0) + '%' : '0%'}
                </div>
                <div className="font-mono text-[10px] text-arena/60 mt-2">Interacciones Efectivas</div>
              </div>

              <div className="bg-asfalto border border-arena/10 rounded-3xl p-6 shadow-xl transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-70 uppercase text-arena">Estatus Legal</span>
                  <ShieldCheck className="text-emerald-400" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">100%</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-2">Saneamiento en SUNARP</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-asfalto border border-arena/10 rounded-xl p-8 shadow-2xl">
              <h3 className="font-sans font-black text-xl text-white mb-6">Acciones Rápidas del Administrador</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => { setEditingProp(null); setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible', ubicacion: '', latitud: '', longitud: '' }); setShowPropModal(true); }}
                  className="bg-terracota text-white px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#a64b2b] transition-colors shadow-lg"
                >
                  <Plus size={16} /> Crear Nueva Propiedad
                </button>
                <button 
                  onClick={() => setActiveTab('clientes')}
                  className="border border-arena/30 text-arena px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-arena hover:text-asfalto transition-colors flex items-center gap-2"
                >
                  <Users size={16} /> Ver Últimos Leads
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPIEDADES (CRUD) */}
        {activeTab === 'propiedades' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-sans font-black text-2xl text-asfalto">Gestión de Propiedades</h3>
              <button 
                onClick={() => { setEditingProp(null); setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible', ubicacion: '', latitud: '', longitud: '' }); setShowPropModal(true); }}
                className="bg-terracota text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#a64b2b] transition-colors shadow-lg"
              >
                <Plus size={16} /> Agregar Propiedad
              </button>
            </div>

            <div className="bg-white border border-asfalto/10 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-asfalto/10 font-mono text-xs uppercase text-terracota bg-asfalto/5">
                      <th className="p-4">Imagen</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Área</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asfalto/10 font-mono text-xs">
                    {filteredProps.map(p => (
                      <tr key={p.id} className="hover:bg-arena/50 transition-colors">
                        <td className="p-4">
                          <img src={normalizeImageUrl(p.imagen_url || p.imagen) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        </td>
                        <td className="p-4 font-sans font-bold text-asfalto text-sm">{p.titulo}</td>
                        <td className="p-4 uppercase text-asfalto/70">{p.tipo_activo || 'Terreno'}</td>
                        <td className="p-4 text-terracota font-bold">${parseFloat(p.precio || 0).toLocaleString()}</td>
                        <td className="p-4 text-asfalto/70">{p.area_m2 || p.area || 'N/A'} m²</td>
                        <td className="p-4">
                          <select 
                            value={p.estado || 'Disponible'}
                            onChange={(e) => handleUpdatePropStatus(p.id, e.target.value)}
                            className="bg-white text-asfalto border border-asfalto/20 px-2 py-1 rounded text-xs focus:outline-none"
                          >
                            <option value="Disponible">Disponible</option>
                            <option value="Reservado">Reservado</option>
                            <option value="Vendido">Vendido</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingProp(p);
                                setPropForm({
                                  titulo: p.titulo || '',
                                  precio: p.precio || '',
                                  area_m2: p.area_m2 || p.area || '',
                                  tipo_activo: p.tipo_activo || 'Terreno',
                                  zonificacion: p.zonificacion || 'Residencial',
                                  imagen_url: p.imagen_url || p.imagen || '',
                                  descripcion: p.descripcion || '',
                                  estado: p.estado || 'Disponible',
                                  ubicacion: p.ubicacion || '',
                                  latitud: p.latitud !== null && p.latitud !== undefined ? String(p.latitud) : '',
                                  longitud: p.longitud !== null && p.longitud !== undefined ? String(p.longitud) : ''
                                });
                                setShowPropModal(true);
                              }}
                              className="p-2 bg-asfalto/5 rounded-lg hover:bg-asfalto/10 text-asfalto transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProperty(p.id)}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProps.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-asfalto/50 font-sans">No se encontraron propiedades.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEADS CRM (CLIENTES) */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <h3 className="font-sans font-black text-2xl text-asfalto">Leads y Prospectos (CRM)</h3>

            <div className="bg-white border border-asfalto/10 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-asfalto/10 font-mono text-xs uppercase text-terracota bg-asfalto/5">
                      <th className="p-4">Fecha / Nombre</th>
                      <th className="p-4">Contacto</th>
                      <th className="p-4">Notas / Interés</th>
                      <th className="p-4">Origen</th>
                      <th className="p-4">Estado Lead</th>
                      <th className="p-4 text-right">Contactar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asfalto/10 font-mono text-xs">
                    {filteredClients.map(c => (
                      <tr key={c.id} className="hover:bg-arena/50 transition-colors">
                        <td className="p-4">
                          <div className="font-sans font-bold text-asfalto text-sm">{c.nombre || c.nombre_completo || 'Lead Anónimo'}</div>
                          <div className="text-asfalto/60 text-[10px]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Reciente'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-asfalto font-bold">{c.telefono}</div>
                          <div className="text-asfalto/70">{c.email}</div>
                        </td>
                        <td className="p-4 max-w-xs truncate text-asfalto/80">{c.notas || c.tipo_interes || 'Sin notas'}</td>
                        <td className="p-4 font-mono text-[10px] text-asfalto/60">{c.origen || 'Web'}</td>
                        <td className="p-4">
                          <select 
                            value={c.estado || c.estado_lead || 'Nuevo'}
                            onChange={(e) => handleUpdateClientStatus(c.id, e.target.value)}
                            className="bg-white text-asfalto border border-asfalto/20 px-2 py-1 rounded text-xs focus:outline-none"
                          >
                            <option value="Nuevo">Nuevo</option>
                            <option value="Contactado">Contactado</option>
                            <option value="En Negociacion">En Negociación</option>
                            <option value="Ganado">Ganado</option>
                            <option value="Perdido">Perdido</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a 
                            href={`https://wa.me/${(c.telefono || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${c.nombre || ''}, te contactamos de Inmobiliaria Norte Chico. Vimos tu consulta sobre: ${c.notas || 'los proyectos en Chancay'}. ¿Tienes 5 minutos para enviarte los detalles y parámetros técnicos del terreno?`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            <MessageSquare size={12} /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-asfalto/50 font-sans">No hay leads registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Property Create/Edit Modal */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 bg-asfalto/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-asfalto/10 rounded-xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-sans font-black text-2xl text-asfalto mb-6">
              {editingProp ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
            </h3>

            <form onSubmit={handleSaveProperty} className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <label className="block text-terracota font-bold mb-1">Título del Proyecto</label>
                <input 
                  required type="text"
                  value={propForm.titulo} onChange={e => setPropForm({...propForm, titulo: e.target.value})}
                  className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                  placeholder="Ej. Terreno Residencial Los Olivos de Chancay"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-terracota font-bold mb-1">Precio ($ USD)</label>
                  <input 
                    required type="number"
                    value={propForm.precio} onChange={e => setPropForm({...propForm, precio: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Área (m²)</label>
                  <input 
                    required type="number"
                    value={propForm.area_m2} onChange={e => setPropForm({...propForm, area_m2: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                    placeholder="160"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-terracota font-bold mb-1">Tipo de Activo</label>
                  <select 
                    value={propForm.tipo_activo} onChange={e => setPropForm({...propForm, tipo_activo: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none shadow-sm"
                  >
                    <option value="Terreno">Terreno</option>
                    <option value="Casa">Casa</option>
                    <option value="Macrolote">Macrolote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Ubicación (Distrito / Dir.)</label>
                  <input 
                    required type="text"
                    value={propForm.ubicacion} onChange={e => setPropForm({...propForm, ubicacion: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                    placeholder="Chancay"
                  />
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Estado</label>
                  <select 
                    value={propForm.estado} onChange={e => setPropForm({...propForm, estado: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none shadow-sm"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-terracota font-bold mb-1">Latitud (Coordenada Maps)</label>
                  <input 
                    type="number" step="any"
                    value={propForm.latitud} onChange={e => setPropForm({...propForm, latitud: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                    placeholder="Ej. -11.5694"
                  />
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Longitud (Coordenada Maps)</label>
                  <input 
                    type="number" step="any"
                    value={propForm.longitud} onChange={e => setPropForm({...propForm, longitud: e.target.value})}
                    className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota shadow-sm"
                    placeholder="Ej. -77.2676"
                  />
                </div>
              </div>

              <div>
                <label className="block text-terracota font-bold mb-1">
                  Galería de Fotos HD (Sube hasta 10+ imágenes o pega enlaces)
                </label>
                
                <div className="flex flex-col gap-3">
                  {/* Selector para múltiples fotos */}
                  <div className="flex items-center gap-3">
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultiImageUpload}
                      disabled={uploadingImage}
                      className="w-full bg-white border border-asfalto/20 rounded-xl p-2 text-asfalto focus:outline-none focus:border-terracota file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-terracota file:text-white hover:file:bg-[#a64b2b] transition-colors cursor-pointer shadow-sm"
                    />
                    {uploadingImage && <span className="text-xs text-asfalto animate-pulse shrink-0 font-bold">Subiendo fotos...</span>}
                  </div>

                  {/* Campo para pegar enlace de foto individual */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={customUrlInput}
                      onChange={e => setCustomUrlInput(e.target.value)}
                      placeholder="Pegar enlace de imagen (https://...)"
                      className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota font-mono text-xs shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImageUrl(customUrlInput)}
                      className="px-4 py-3 bg-terracota/80 hover:bg-terracota text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                    >
                      + Agregar Enlace
                    </button>
                  </div>
                </div>

                {/* Vista Previa de la Galería de Fotos */}
                {(() => {
                  const currentList = getImagesList(propForm.imagen_url);
                  if (!currentList.length) return null;
                  return (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-600">
                          📷 {currentList.length} Foto{currentList.length > 1 ? 's' : ''} vinculada{currentList.length > 1 ? 's' : ''} al lote
                        </span>
                        <span className="text-[10px] text-asfalto/60">
                          (La foto #1 es la portada principal)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 bg-asfalto/5 rounded-xl border border-asfalto/10">
                        {currentList.map((imgUrl, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-asfalto/20 bg-asfalto/10 aspect-video shadow-sm">
                            <img src={normalizeImageUrl(imgUrl)} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-black/75 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                              {idx === 0 ? '⭐ Portada' : `#${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-all shadow-md"
                              title="Eliminar foto"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-terracota font-bold mb-1">Descripción</label>
                <textarea 
                  rows="3"
                  value={propForm.descripcion} onChange={e => setPropForm({...propForm, descripcion: e.target.value})}
                  className="w-full bg-white border border-asfalto/20 rounded-xl p-3 text-asfalto focus:outline-none focus:border-terracota resize-none shadow-sm"
                  placeholder="Ubicación privilegiada en avenida proyectada..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" onClick={() => setShowPropModal(false)}
                  className="px-6 py-3 rounded-full border border-asfalto/20 text-asfalto hover:bg-asfalto/5 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-full bg-terracota text-white font-bold hover:bg-[#a64b2b] shadow-lg transition-colors"
                >
                  Guardar Propiedad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
