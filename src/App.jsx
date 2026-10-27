import React, { useState, useEffect, lazy, Suspense } from 'react';
import MapaRuta from './components/MapaRuta';
import Simulacro from './components/simulacro/Simulacro';

// Carga diferida (lazy) del Globo 3D con Three.js para optimizar rendimiento inicial
const Globo3D = lazy(() => import('./components/Globo3D'));

const API_URL = "https://sismos-backend-app.onrender.com/api/temblor/";
const BACKEND_BASE_URL = "https://sismos-backend-app.onrender.com";

export default function App() {
  // Pestaña activa: 'monitoreo' | 'reportar' | 'simulacro' | 'curiosidades'
  const [tabActiva, setTabActiva] = useState('monitoreo');
  
  // Estado de alertas e indicador de servidor Render en reposo
  const [alertas, setAlertas] = useState([]);
  const [despertandoServidor, setDespertandoServidor] = useState(false);
  const [mensajeToast, setMensajeToast] = useState(null);

  // Formulario de reporte
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Sismo / Temblor',
    nivel_riesgo: 'amarillo', // verde, amarillo, naranja, rojo
    descripcion: '',
    foto: null,
    video: null,
  });

  // Vistas previas multimedia
  const [previewFoto, setPreviewFoto] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // Cargar historial de alertas desde la API
  const obtenerAlertas = async () => {
    const timer = setTimeout(() => setDespertandoServidor(true), 1500);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAlertas(data);
      }
    } catch (err) {
      console.error('Error al conectar con la API:', err);
      mostrarToast('Error de conexión con el servidor', 'rojo');
    } finally {
      clearTimeout(timer);
      setDespertandoServidor(false);
    }
  };

  useEffect(() => {
    obtenerAlertas();
  }, []);

  // Notificación tipo Toast
  const mostrarToast = (mensaje, tipo = 'verde') => {
    setMensajeToast({ mensaje, tipo });
    setTimeout(() => setMensajeToast(null), 4000);
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de archivos y creación de vistas previas
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, [name]: file }));

    if (name === 'foto') {
      setPreviewFoto(URL.createObjectURL(file));
    } else if (name === 'video') {
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  // Enviar reporte
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica del formulario
    if (!formData.nombre.trim() || !formData.descripcion.trim()) {
      mostrarToast('Por favor completa todos los campos requeridos', 'naranja');
      return;
    }

    setSubiendo(true);
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('tipo', formData.tipo);
    data.append('nivel_riesgo', formData.nivel_riesgo);
    data.append('descripcion', formData.descripcion);
    if (formData.foto) data.append('foto', formData.foto);
    if (formData.video) data.append('video', formData.video);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        mostrarToast('✅ Alerta publicada con éxito', 'verde');
        setFormData({
          nombre: '',
          tipo: 'Sismo / Temblor',
          nivel_riesgo: 'amarillo',
          descripcion: '',
          foto: null,
          video: null,
        });
        setPreviewFoto(null);
        setPreviewVideo(null);
        e.target.reset();
        obtenerAlertas();
        setTabActiva('monitoreo'); // Redirigir al mapa tras publicar
      } else {
        mostrarToast('Ocurrió un error al procesar el reporte', 'rojo');
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      mostrarToast('Error de conexión con la red', 'rojo');
    } finally {
      setSubiendo(false);
    }
  };

  // Construir URL pública para evidencias multimedia
  const obtenerUrlMedia = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BACKEND_BASE_URL}${url}`;
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Toast Notification Banner */}
      {mensajeToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 24px', borderRadius: '8px', color: '#fff',
          backgroundColor: mensajeToast.tipo === 'verde' ? '#10b981' : mensajeToast.tipo === 'rojo' ? '#ef4444' : '#f59e0b',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: 'bold'
        }}>
          {mensajeToast.mensaje}
        </div>
      )}

      {/* Header Principal */}
      <header className="header-app" style={{ textAlign: 'center', marginBottom: '25px' }}>
        <span className="badge-rojo" style={{ padding: '6px 12px', background: '#dc2626', borderRadius: '4px', fontSize: '0.85rem' }}>
          🚨 RED DE ALERTAS TEMPRANAS
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '10px' }}>Sistema de Alertas Tempranas E.M.</h1>
        <p style={{ color: '#94a3b8' }}>Monitoreo en tiempo real, gestión de riesgos y respuesta comunitaria.</p>
      </header>

      {/* Aviso de reconexión si Render está despertando */}
      {despertandoServidor && (
        <div className="spinner-cargando" style={{ backgroundColor: '#0f172a', borderRadius: '10px', marginBottom: '20px' }}>
          <div className="loader"></div>
          <p>Conectando con el servidor en la nube... (esto puede tardar unos segundos la primera vez)</p>
        </div>
      )}

      {/* Panel Superior de Estadísticas */}
      <section className="panel-estadisticas">
        <div className="tarjeta-stat">
          <span>Alertas Registradas</span>
          <div className="valor">{alertas.length}</div>
        </div>
        <div className="tarjeta-stat">
          <span>Última Alerta</span>
          <div className="valor" style={{ fontSize: '1.1rem', color: '#f8fafc' }}>
            {alertas.length > 0 ? alertas[0].tipo || 'Sismo' : 'Sin datos'}
          </div>
        </div>
        <div className="tarjeta-stat">
          <span>Estado del Sistema</span>
          <div className="valor" style={{ color: '#10b981', fontSize: '1.2rem' }}>● Operativo</div>
        </div>
      </section>

      {/* Navegación por Pestañas */}
      <nav className="nav-pestanas">
        <button className={`btn-pestana ${tabActiva === 'monitoreo' ? 'activa' : ''}`} onClick={() => setTabActiva('monitoreo')}>
          🌍 Monitoreo 3D y Mapa
        </button>
        <button className={`btn-pestana ${tabActiva === 'reportar' ? 'activa' : ''}`} onClick={() => setTabActiva('reportar')}>
          📢 Reportar Emergencia
        </button>
        <button className={`btn-pestana ${tabActiva === 'simulacro' ? 'activa' : ''}`} onClick={() => setTabActiva('simulacro')}>
          🛡️ Simulacro
        </button>
        <button className={`btn-pestana ${tabActiva === 'curiosidades' ? 'activa' : ''}`} onClick={() => setTabActiva('curiosidades')}>
          💡 Qué hacer y curiosidades
        </button>
      </nav>

      {/* CONTENIDO DE PESTAÑAS */}

      {/* 1. Pestaña: Monitoreo */}
      {tabActiva === 'monitoreo' && (
        <div className="grid-monitoreo">
          {/* Columna Izquierda: Mapa 2D e Historial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="tarjeta" style={{ background: '#0f172a', padding: '15px', borderRadius: '10px' }}>
              <h2>📍 Mapa de Ubicación Regional</h2>
              <MapaRuta tabActiva={tabActiva} />
            </div>

            <div className="tarjeta" style={{ background: '#0f172a', padding: '15px', borderRadius: '10px' }}>
              <h2>📑 Historial de Alertas ({alertas.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                {alertas.length > 0 ? (
                  alertas.map((item) => (
                    <div 
                      key={item.id} 
                      className={`alerta-${item.nivel_riesgo || 'amarillo'}`}
                      style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>🚨 {item.nombre}</strong>
                        <span style={{ fontSize: '0.8rem', background: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.tipo}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0', color: '#cbd5e1' }}>{item.descripcion}</p>
                      
                      {item.foto && (
                        <div className="preview-container">
                          <img src={obtenerUrlMedia(item.foto)} alt="Evidencia" />
                        </div>
                      )}

                      <small style={{ color: '#64748b' }}>
                        Reportado: {new Date(item.fecha || Date.now()).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8' }}>No hay alertas recientes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Globo Terráqueo 3D */}
          <div className="tarjeta" style={{ background: '#0f172a', padding: '15px', borderRadius: '10px' }}>
            <Suspense fallback={
              <div className="spinner-cargando">
                <div className="loader"></div>
                <p>Cargando simulación 3D del planeta...</p>
              </div>
            }>
              <Globo3D alertas={alertas} />
            </Suspense>
          </div>
        </div>
      )}

      {/* 2. Pestaña: Reportar Emergencia */}
      {tabActiva === 'reportar' && (
        <section className="tarjeta" style={{ background: '#0f172a', padding: '20px', borderRadius: '10px', maxWidth: '700px', margin: '0 auto' }}>
          <h2>📢 Publicar Nuevo Evento de Riesgo</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            
            <div>
              <label>Nombre del Reportante:</label>
              <input 
                type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required 
                placeholder="Ej. Estiben Muñoz" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label>Tipo de Emergencia:</label>
                <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                  <option value="Sismo / Temblor">🚨 Sismo / Temblor</option>
                  <option value="Inundación">🌊 Inundación</option>
                  <option value="Incendio">🔥 Incendio</option>
                  <option value="Deslizamiento">⛰️ Deslizamiento</option>
                </select>
              </div>

              <div>
                <label>Nivel de Riesgo:</label>
                <select name="nivel_riesgo" value={formData.nivel_riesgo} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                  <option value="verde">🟢 Bajo (Informativo)</option>
                  <option value="amarillo">🟡 Moderado</option>
                  <option value="naranja">🟠 Alto Risk</option>
                  <option value="rojo">🔴 Crítico / Emergencia</option>
                </select>
              </div>
            </div>

            <div>
              <label>Descripción del Suceso:</label>
              <textarea 
                name="descripcion" value={formData.descripcion} onChange={handleInputChange} required 
                placeholder="Detalla lo sucedido..." style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', minHeight: '100px' }}
              />
            </div>

            {/* Carga de Archivos con Vista Previa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label>Foto de Evidencia:</label>
                <input type="file" name="foto" accept="image/*" onChange={handleFileChange} style={{ marginTop: '5px' }} />
                {previewFoto && (
                  <div className="preview-container">
                    <img src={previewFoto} alt="Previsualización foto" />
                  </div>
                )}
              </div>

              <div>
                <label>Video de Evidencia:</label>
                <input type="file" name="video" accept="video/*" onChange={handleFileChange} style={{ marginTop: '5px' }} />
                {previewVideo && (
                  <div className="preview-container">
                    <video src={previewVideo} controls />
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" disabled={subiendo} 
              style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              {subiendo ? 'Publicando en Render...' : 'Emitir Alerta a la Comunidad'}
            </button>
          </form>
        </section>
      )}

      {/* 3. Pestaña Vacía: Simulacro */}
      {tabActiva === 'simulacro' && (
  <Simulacro />
)}

      {/* 4. Pestaña Vacía: Qué hacer y curiosidades */}
      {tabActiva === 'curiosidades' && (
        <div className="tarjeta" style={{ background: '#0f172a', padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
          <h2>💡 Guía de Respuesta y Curiosidades Sísmicas</h2>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Contenido educativo e instrucciones en caso de sismos e inundaciones próximamente disponible.</p>
        </div>
      )}

    </div>
  );
}