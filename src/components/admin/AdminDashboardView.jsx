"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../supabaseClient';
import { savePropertyAction, deletePropertyAction } from '../../app/actions/adminActions';
import { 
  Building2, Users, TrendingUp, ShieldCheck, Plus, Trash2, Edit3, 
  Search, LogOut, Lock, ArrowLeft, RefreshCw, CheckCircle, MessageSquare, PhoneCall
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
    titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible'
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
        imagen_url: propForm.imagen_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
        descripcion: propForm.descripcion,
        estado: propForm.estado
      };

      const result = await savePropertyAction(sessionToken, payload, !!editingProp, editingProp?.id);
      
      if (!result.success) throw new Error(result.error);

      setShowPropModal(false);
      setEditingProp(null);
      setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible' });
      fetchData();
    } catch (err) {
      alert("Error al guardar propiedad: " + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('propiedades')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('propiedades')
        .getPublicUrl(filePath);

      setPropForm({ ...propForm, imagen_url: data.publicUrl });
    } catch (error) {
      alert('Error al subir imagen: Asegúrate de que el bucket "propiedades" exista en Supabase y sea público. Detalle: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm("¿Seguro de eliminar este proyecto del catálogo?")) return;
    try {
      const result = await deletePropertyAction(sessionToken, id);
      if (!result.success) throw new Error(result.error);
      fetchData();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
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
      <main className="bg-asfalto min-h-screen text-arena flex items-center justify-center px-4">
        <div className="bg-asfalto border border-terracota/30 rounded-xl p-10 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-terracota/20 border border-terracota/40 rounded-full flex items-center justify-center mx-auto mb-6 text-terracota">
            <Lock size={32} />
          </div>

          <h1 className="font-sans font-black text-2xl text-white mb-2">Panel Administrativo</h1>
          <p className="font-mono text-xs opacity-60 mb-8">Inmobiliaria Norte Chico S.A.C.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left font-mono text-xs">
            <div>
              <label className="block text-terracota font-bold mb-1 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@inmobiliarianortechico.pe"
                className="w-full bg-asfalto/80 border border-arena/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-terracota"
                required
              />
            </div>
            <div>
              <label className="block text-terracota font-bold mb-1 uppercase tracking-wider">Contraseña</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-asfalto/80 border border-arena/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-terracota"
                required
              />
            </div>
            {authError && <div className="text-red-400 text-center font-mono text-xs mt-1">{authError}</div>}
            <button 
              type="submit"
              className="mt-2 bg-terracota text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#a64b2b] transition-colors shadow-lg"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-arena/10">
            <Link href="/" className="font-mono text-xs opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
    <main className="bg-asfalto text-arena min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-arena/10 bg-asfalto sticky top-0 z-40 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-sans font-black text-xl text-white tracking-tight">
            INMOBILIARIA NORTE CHICO
          </Link>
          <span className="bg-terracota/20 border border-terracota/40 text-terracota px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase">
            Dashboard Admin
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={fetchData} className="font-mono text-xs opacity-70 hover:opacity-100 flex items-center gap-2" title="Recargar Datos">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button onClick={handleLogout} className="bg-arena/10 hover:bg-red-500/20 text-arena hover:text-red-400 px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 transition-colors">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-[90rem] mx-auto px-8 py-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-arena/10 pb-6">
          <div className="flex gap-3 font-mono text-xs">
            <button 
              onClick={() => setActiveTab('kpis')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'kpis' ? 'bg-terracota text-white shadow-lg' : 'bg-arena/5 text-arena/70 hover:bg-arena/10'}`}
            >
              📊 Resumen KPIs
            </button>
            <button 
              onClick={() => setActiveTab('propiedades')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'propiedades' ? 'bg-terracota text-white shadow-lg' : 'bg-arena/5 text-arena/70 hover:bg-arena/10'}`}
            >
              🏠 Propiedades ({properties.length})
            </button>
            <button 
              onClick={() => setActiveTab('clientes')} 
              className={`px-6 py-3 rounded-full font-bold transition-all ${activeTab === 'clientes' ? 'bg-terracota text-white shadow-lg' : 'bg-arena/5 text-arena/70 hover:bg-arena/10'}`}
            >
              👥 Leads CRM ({clients.length})
            </button>
          </div>

          <div className="w-full md:w-72 relative">
            <Search size={16} className="absolute left-4 top-3.5 opacity-40" />
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-asfalto/80 border border-arena/20 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-arena/40 focus:outline-none focus:border-terracota"
            />
          </div>
        </div>

        {/* TAB 1: KPIs RESUMEN */}
        {activeTab === 'kpis' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-asfalto/90 border border-arena/15 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-60 uppercase">Total Propiedades</span>
                  <Building2 className="text-terracota" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">{properties.length}</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-2">Disponibles en Catálogo</div>
              </div>

              <div className="bg-asfalto/90 border border-arena/15 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-60 uppercase">Leads Capturados</span>
                  <Users className="text-terracota" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">{clients.length}</div>
                <div className="font-mono text-[10px] text-terracota mt-2">Clientes Registrados CRM</div>
              </div>

              <div className="bg-asfalto/90 border border-arena/15 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-60 uppercase">Tasa de Conversión</span>
                  <TrendingUp className="text-emerald-400" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-emerald-400">
                  {clients.length > 0 ? ((clients.filter(c => c.estado === 'Ganado' || c.estado === 'Contactado').length / clients.length) * 100).toFixed(0) + '%' : '0%'}
                </div>
                <div className="font-mono text-[10px] opacity-50 mt-2">Interacciones Efectivas</div>
              </div>

              <div className="bg-asfalto/90 border border-arena/15 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs opacity-60 uppercase">Estatus Legal</span>
                  <ShieldCheck className="text-emerald-400" size={20} />
                </div>
                <div className="font-sans font-black text-4xl text-white">100%</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-2">Saneamiento en SUNARP</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-asfalto border border-arena/15 rounded-xl p-8">
              <h3 className="font-sans font-black text-xl text-white mb-6">Acciones Rápidas del Administrador</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => { setEditingProp(null); setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible' }); setShowPropModal(true); }}
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
              <h3 className="font-sans font-black text-2xl text-white">Gestión de Propiedades</h3>
              <button 
                onClick={() => { setEditingProp(null); setPropForm({ titulo: '', precio: '', area_m2: '', tipo_activo: 'Terreno', zonificacion: 'Residencial', imagen_url: '', descripcion: '', estado: 'Disponible' }); setShowPropModal(true); }}
                className="bg-terracota text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#a64b2b] transition-colors shadow-lg"
              >
                <Plus size={16} /> Agregar Propiedad
              </button>
            </div>

            <div className="bg-asfalto/90 border border-arena/15 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-arena/10 font-mono text-xs uppercase text-terracota">
                      <th className="p-4">Imagen</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Área</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-arena/10 font-mono text-xs">
                    {filteredProps.map(p => (
                      <tr key={p.id} className="hover:bg-arena/5 transition-colors">
                        <td className="p-4">
                          <img src={normalizeImageUrl(p.imagen_url || p.imagen) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        </td>
                        <td className="p-4 font-sans font-bold text-white text-sm">{p.titulo}</td>
                        <td className="p-4 uppercase">{p.tipo_activo || 'Terreno'}</td>
                        <td className="p-4 text-terracota font-bold">${parseFloat(p.precio || 0).toLocaleString()}</td>
                        <td className="p-4">{p.area_m2 || p.area || 'N/A'} m²</td>
                        <td className="p-4">
                          <select 
                            value={p.estado || 'Disponible'}
                            onChange={(e) => handleUpdatePropStatus(p.id, e.target.value)}
                            className="bg-asfalto text-white border border-arena/20 px-2 py-1 rounded text-xs focus:outline-none"
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
                                  estado: p.estado || 'Disponible'
                                });
                                setShowPropModal(true);
                              }}
                              className="p-2 bg-arena/10 rounded-lg hover:bg-arena/20 text-white transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProperty(p.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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
                        <td colSpan="7" className="p-8 text-center opacity-50 font-sans">No se encontraron propiedades.</td>
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
            <h3 className="font-sans font-black text-2xl text-white">Leads y Prospectos (CRM)</h3>

            <div className="bg-asfalto/90 border border-arena/15 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-arena/10 font-mono text-xs uppercase text-terracota">
                      <th className="p-4">Fecha / Nombre</th>
                      <th className="p-4">Contacto</th>
                      <th className="p-4">Notas / Interés</th>
                      <th className="p-4">Origen</th>
                      <th className="p-4">Estado Lead</th>
                      <th className="p-4 text-right">Contactar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-arena/10 font-mono text-xs">
                    {filteredClients.map(c => (
                      <tr key={c.id} className="hover:bg-arena/5 transition-colors">
                        <td className="p-4">
                          <div className="font-sans font-bold text-white text-sm">{c.nombre || c.nombre_completo || 'Lead Anónimo'}</div>
                          <div className="opacity-40 text-[10px]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Reciente'}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-white font-bold">{c.telefono}</div>
                          <div className="opacity-60">{c.email}</div>
                        </td>
                        <td className="p-4 max-w-xs truncate opacity-80">{c.notas || c.tipo_interes || 'Sin notas'}</td>
                        <td className="p-4 font-mono text-[10px] text-arena/60">{c.origen || 'Web'}</td>
                        <td className="p-4">
                          <select 
                            value={c.estado || c.estado_lead || 'Nuevo'}
                            onChange={(e) => handleUpdateClientStatus(c.id, e.target.value)}
                            className="bg-asfalto text-white border border-arena/20 px-2 py-1 rounded text-xs focus:outline-none"
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
                        <td colSpan="6" className="p-8 text-center opacity-50 font-sans">No hay leads registrados.</td>
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-asfalto border border-terracota/30 rounded-xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-sans font-black text-2xl text-white mb-6">
              {editingProp ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
            </h3>

            <form onSubmit={handleSaveProperty} className="flex flex-col gap-4 font-mono text-xs">
              <div>
                <label className="block text-terracota font-bold mb-1">Título del Proyecto</label>
                <input 
                  required type="text"
                  value={propForm.titulo} onChange={e => setPropForm({...propForm, titulo: e.target.value})}
                  className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-3 text-white focus:outline-none focus:border-terracota"
                  placeholder="Ej. Terreno Residencial Los Olivos de Chancay"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-terracota font-bold mb-1">Precio ($ USD)</label>
                  <input 
                    required type="number"
                    value={propForm.precio} onChange={e => setPropForm({...propForm, precio: e.target.value})}
                    className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-3 text-white focus:outline-none focus:border-terracota"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Área (m²)</label>
                  <input 
                    required type="number"
                    value={propForm.area_m2} onChange={e => setPropForm({...propForm, area_m2: e.target.value})}
                    className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-3 text-white focus:outline-none focus:border-terracota"
                    placeholder="160"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-terracota font-bold mb-1">Tipo de Activo</label>
                  <select 
                    value={propForm.tipo_activo} onChange={e => setPropForm({...propForm, tipo_activo: e.target.value})}
                    className="w-full bg-asfalto border border-arena/20 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Terreno">Terreno</option>
                    <option value="Casa">Casa</option>
                    <option value="Macrolote">Macrolote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-terracota font-bold mb-1">Estado</label>
                  <select 
                    value={propForm.estado} onChange={e => setPropForm({...propForm, estado: e.target.value})}
                    className="w-full bg-asfalto border border-arena/20 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-terracota font-bold mb-1">Imagen HD (Sube una foto)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-2 text-white focus:outline-none focus:border-terracota file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-terracota file:text-white hover:file:bg-[#a64b2b] transition-colors"
                  />
                  {uploadingImage && <span className="text-xs text-arena animate-pulse">Subiendo...</span>}
                </div>
                {propForm.imagen_url && (
                  <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-arena/20">
                    <img src={normalizeImageUrl(propForm.imagen_url)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-terracota font-bold mb-1">Descripción</label>
                <textarea 
                  rows="3"
                  value={propForm.descripcion} onChange={e => setPropForm({...propForm, descripcion: e.target.value})}
                  className="w-full bg-asfalto/80 border border-arena/20 rounded-xl p-3 text-white focus:outline-none focus:border-terracota resize-none"
                  placeholder="Ubicación privilegiada en avenida proyectada..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" onClick={() => setShowPropModal(false)}
                  className="px-6 py-3 rounded-full border border-arena/30 text-arena hover:bg-arena/10 font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-full bg-terracota text-white font-bold hover:bg-[#a64b2b]"
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
