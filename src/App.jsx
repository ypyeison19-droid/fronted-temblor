import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Corrección para que los iconos predeterminados de Leaflet funcionen bien en React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Componente para capturar el clic en el mapa y guardar las coordenadas
function SelectorCoordenadas({ setCoordenadas }) {
  useMapEvents({
    click(e) {
      setCoordenadas({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function App() {
  const [temblores, setTemblores] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [claveInput, setClaveInput] = useState('')
  
  // Coordenadas por defecto (Ejemplo: Popayán / Cauca)
  const [posicionSeleccionada, setPosicionSeleccionada] = useState({ lat: 2.4419, lng: -76.6063 })
  const [imagenBase64, setImagenBase64] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    tipo_alerta: 'Sismo',
    magnitud: '',
    profundidad: '',
    rango: '3',
    lugar: '',
    area: '',
    fecha: '',
    hora: ''
  })

  const CLAVE_ADMIN = 'admin123'
  const API_URL = 'https://sismos-backend-6qsi.onrender.com/api/temblores/'

  const obtenerTemblores = async () => {
    try {
      const res = await axios.get(API_URL)
      setTemblores(res.data)
    } catch (error) {
      console.error('Error al obtener registros:', error)
    }
  }

  useEffect(() => {
    obtenerTemblores()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Lectura y conversión de archivo/foto a Base64
  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenBase64(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const datosEnvio = {
      ...formData,
      magnitud: esEventoSismico(formData.tipo_alerta) ? formData.magnitud : '0.0',
      profundidad: esEventoSismico(formData.tipo_alerta) ? formData.profundidad : '0.0',
      area: `${formData.area || 'Sin detalles'} | Lat: ${posicionSeleccionada.lat.toFixed(4)}, Lng: ${posicionSeleccionada.lng.toFixed(4)}`
    }

    try {
      if (editandoId) {
        await axios.put(`${API_URL}${editandoId}/`, datosEnvio)
        alert('¡Registro actualizado exitosamente!')
        setEditandoId(null)
      } else {
        await axios.post(API_URL, datosEnvio)
        alert('¡Reporte de alerta enviado exitosamente!')
      }
      limpiarFormulario()
      obtenerTemblores()
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('Ocurrió un error al enviar el reporte.')
    }
  }

  const handleEditar = (temblor) => {
    setEditandoId(temblor.id)
    setFormData({
      nombre: temblor.nombre,
      tipo_alerta: temblor.tipo_alerta || 'Sismo',
      magnitud: temblor.magnitud,
      profundidad: temblor.profundidad,
      rango: temblor.rango,
      lugar: temblor.lugar,
      area: temblor.area,
      fecha: temblor.fecha,
      hora: temblor.hora
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      tipo_alerta: 'Sismo',
      magnitud: '',
      profundidad: '',
      rango: '3',
      lugar: '',
      area: '',
      fecha: '',
      hora: ''
    })
    setImagenBase64('')
    setEditandoId(null)
  }

  const verificarAdmin = (e) => {
    e.preventDefault()
    if (claveInput === CLAVE_ADMIN) {
      setEsAdmin(true)
      alert('Modo Administrador Activado')
    } else {
      alert('Clave incorrecta')
    }
  }

  const esEventoSismico = (tipo) => tipo === 'Sismo' || tipo === 'Volcán'

  const getIconoAlerta = (tipo) => {
    switch (tipo) {
      case 'Volcán': return '🌋'
      case 'Deslizamiento': return '⛰️'
      case 'Inundación': return '🌊'
      case 'Incendio': return '🔥'
      default: return '🌋'
    }
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px 10px' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🚨 Red de Alertas y Emergencias Comunitarias
          </span>
          <h1 style={{ fontSize: '28px', marginTop: '10px', marginBottom: '5px' }}>Sistema de Alertas Tempranas</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Informa sobre eventos de riesgo, ubícalos en el mapa y adjunta evidencias.</p>
        </header>

        {/* MAPA GENERAL */}
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '16px', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '10px' }}>🗺️ Ubicación del Evento en Mapa</h3>
          <div style={{ height: '260px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={[posicionSeleccionada.lat, posicionSeleccionada.lng]} zoom={8} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[posicionSeleccionada.lat, posicionSeleccionada.lng]}>
                <Popup>Punto seleccionado</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#38bdf8' }}>
            {editandoId ? '✏️ Editar Registro' : '📢 Reportar un Evento de Riesgo'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Nombre del Reportante</label>
              <input name="nombre" value={formData.nombre} placeholder="Ej. Estiben Muñoz" onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Tipo de Evento / Emergencia</label>
              <select name="tipo_alerta" value={formData.tipo_alerta} onChange={handleChange} style={inputStyle}>
                <option value="Sismo">🌋 Sismo / Temblor</option>
                <option value="Volcán">🌋 Actividad Volcánica</option>
                <option value="Deslizamiento">⛰️ Deslizamiento / Derrumbe</option>
                <option value="Inundación">🌊 Inundación / Creciente</option>
                <option value="Incendio">🔥 Incendio Forestal</option>
              </select>
            </div>

            {/* SELECCIÓN DE COORDENADAS */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', display: 'block' }}>
                📍 Haz clic en el mapa para ajustar la posición de la alerta:
              </label>
              <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <MapContainer center={[posicionSeleccionada.lat, posicionSeleccionada.lng]} zoom={9} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <SelectorCoordenadas setCoordenadas={setPosicionSeleccionada} />
                  <Marker position={[posicionSeleccionada.lat, posicionSeleccionada.lng]} />
                </MapContainer>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Coordenadas seleccionadas: Lat {posicionSeleccionada.lat.toFixed(4)}, Lng {posicionSeleccionada.lng.toFixed(4)}
              </p>
            </div>

            {/* SUBIR O TOMAR FOTO */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>📷 Adjuntar Fotografía (Cámara / Archivo)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImagenChange} 
                style={{ ...inputStyle, padding: '6px' }} 
              />
              {imagenBase64 && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img src={imagenBase64} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', border: '1px solid #38bdf8' }} />
                </div>
              )}
            </div>

            {/* CAMPOS DINÁMICOS */}
            {esEventoSismico(formData.tipo_alerta) ? (
              <>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Magnitud (M)</label>
                  <input name="magnitud" type="number" step="0.1" value={formData.magnitud} placeholder="Ej. 5.2" onChange={handleChange} required style={inputStyle} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Profundidad (km)</label>
                  <input name="profundidad" type="number" step="0.1" value={formData.profundidad} placeholder="Ej. 30" onChange={handleChange} required style={inputStyle} />
                </div>
              </>
            ) : (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Detalles / Observaciones de la Emergencia</label>
                <input name="area" value={formData.area} placeholder="Ej. Bloqueo de vía por derrumbe de piedras" onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Lugar / Municipio</label>
              <input name="lugar" value={formData.lugar} placeholder="Ej. Popayán" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Nivel de Alerta (1 a 5)</label>
              <input name="rango" type="number" min="1" max="5" value={formData.rango} placeholder="Ej. 3" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Fecha del Evento</label>
              <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Hora exacta</label>
              <input name="hora" type="time" value={formData.hora} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ ...btnStyle, backgroundColor: editandoId ? '#16a34a' : '#2563eb', flex: 1 }}>
                {editandoId ? 'Guardar Cambios' : 'Publicar Alerta con Foto y Mapa'}
              </button>
              {editandoId && (
                <button type="button" onClick={limpiarFormulario} style={{ ...btnStyle, backgroundColor: '#64748b' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Historial de Reportes */}
        <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📋 Historial de Alertas Publicadas</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{temblores.length} reportes</span>
        </h2>

        {/* Lista de Alertas en Historial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {temblores.map((t) => (
            <div key={t.id} style={{ backgroundColor: '#1e293b', borderLeft: '5px solid #ef4444', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{getIconoAlerta(t.tipo_alerta)}</span>
                  <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{t.lugar}</strong>
                  <span style={{ backgroundColor: '#334155', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {t.tipo_alerta || 'Sismo'}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '4px 0' }}>
                  Detalles / Ubicación: {t.area || 'Sin detalles'}
                </p>

                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Reportado por <span style={{ color: '#38bdf8' }}>{t.nombre}</span> el {t.fecha} a las {t.hora}
                </p>

                {/* Muestra la imagen adjunta en la tarjeta si está disponible */}
                {imagenBase64 && t.id === editandoId && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={imagenBase64} 
                      alt="Evidencia del suceso" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }} 
                    />
                  </div>
                )}
              </div>

              {esAdmin && (
                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  <button onClick={() => handleEditar(t)} style={smallBtnStyle('#eab308')}>Editar</button>
                  <button onClick={() => axios.delete(`${API_URL}${t.id}/`).then(() => obtenerTemblores())} style={smallBtnStyle('#ef4444')}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modo Admin */}
        <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #334155', textAlign: 'center' }}>
          {!esAdmin ? (
            <form onSubmit={verificarAdmin} style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <input 
                type="password" 
                placeholder="Clave de admin para editar/borrar" 
                value={claveInput} 
                onChange={(e) => setClaveInput(e.target.value)}
                style={{ ...inputStyle, width: '220px', padding: '6px 12px', fontSize: '12px' }}
              />
              <button type="submit" style={{ ...btnStyle, padding: '6px 12px', fontSize: '12px', backgroundColor: '#475569' }}>Acceder</button>
            </form>
          ) : (
            <p style={{ fontSize: '12px', color: '#22c55e' }}>✅ Modo Administrador Activo</p>
          )}
        </footer>

      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: 'white',
  boxSizing: 'border-box',
  marginTop: '4px'
}

const btnStyle = {
  padding: '12px',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
}

const smallBtnStyle = (bgColor) => ({
  padding: '6px 10px',
  backgroundColor: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  cursor: 'pointer'
})

export default App