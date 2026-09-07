import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [temblores, setTemblores] = useState([])
  const [editandoId, setEditandoId] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [claveInput, setClaveInput] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    magnitud: '',
    profundidad: '',
    rango: '',
    lugar: '',
    area: '',
    fecha: '',
    hora: ''
  })

  // CLAVE PARA HABILITAR EDICIÓN Y ELIMINACIÓN
  const CLAVE_ADMIN = 'admin070724' 

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editandoId) {
        await axios.put(`${API_URL}${editandoId}/`, formData)
        alert('¡Registro actualizado exitosamente!')
        setEditandoId(null)
      } else {
        await axios.post(API_URL, formData)
        alert('¡Reporte de sismo enviado exitosamente!')
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

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await axios.delete(`${API_URL}${id}/`)
        alert('Registro eliminado.')
        obtenerTemblores()
      } catch (error) {
        console.error('Error al eliminar:', error)
      }
    }
  }

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      magnitud: '',
      profundidad: '',
      rango: '',
      lugar: '',
      area: '',
      fecha: '',
      hora: ''
    })
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

  const getBadgeColor = (mag) => {
    const m = parseFloat(mag)
    if (m >= 6.0) return '#dc3545' // Rojo (Fuerte)
    if (m >= 4.5) return '#fd7e14' // Naranja (Moderado)
    return '#28a745' // Verde (Leve)
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px 10px' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🔴 Red de Monitoreo Comunitaria
          </span>
          <h1 style={{ fontSize: '28px', marginTop: '10px', marginBottom: '5px' }}>Reporte de Sismos</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Informa eventos sísmicos y consulta los registros de la comunidad en tiempo real.</p>
        </header>

        {/* Formulario */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#38bdf8' }}>
            {editandoId ? '✏️ Editar Reporte' : '📝 Enviar Nuevo Reporte'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Nombre del Reportante</label>
              <input name="nombre" value={formData.nombre} placeholder="Ej. Juan Pérez" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Magnitud (M)</label>
              <input name="magnitud" type="number" step="0.1" value={formData.magnitud} placeholder="Ej. 5.2" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Profundidad (km)</label>
              <input name="profundidad" type="number" step="0.1" value={formData.profundidad} placeholder="Ej. 30" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Lugar / Municipio</label>
              <input name="lugar" value={formData.lugar} placeholder="Ej. Cali" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Área / Departamento</label>
              <input name="area" value={formData.area} placeholder="Ej. Valle del Cauca" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Rango / Intensidad</label>
              <input name="rango" type="number" value={formData.rango} placeholder="Ej. 4" onChange={handleChange} required style={inputStyle} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Fecha</label>
              <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#cbd5e1' }}>Hora local</label>
              <input name="hora" type="time" value={formData.hora} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ ...btnStyle, backgroundColor: editandoId ? '#16a34a' : '#2563eb', flex: 1 }}>
                {editandoId ? 'Guardar Cambios' : 'Enviar Reporte'}
              </button>
              {editandoId && (
                <button type="button" onClick={limpiarFormulario} style={{ ...btnStyle, backgroundColor: '#64748b' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Historial de Temblores */}
        <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📋 Historial de Sismos</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{temblores.length} registros</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {temblores.map((t) => (
            <div key={t.id} style={{ backgroundColor: '#1e293b', borderLeft: `5px solid ${getBadgeColor(t.magnitud)}`, padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{t.lugar}, {t.area}</strong>
                  <span style={{ backgroundColor: getBadgeColor(t.magnitud), color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                    {t.magnitud} M
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0' }}>
                  Profundidad: <strong style={{ color: '#cbd5e1' }}>{t.profundidad} km</strong> | Rango: {t.rango}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  Reportado por <span style={{ color: '#38bdf8' }}>{t.nombre}</span> el {t.fecha} a las {t.hora}
                </p>
              </div>

              {/* Botones protegidos por modo Administrador */}
              {esAdmin && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEditar(t)} style={smallBtnStyle('#eab308')}>Editar</button>
                  <button onClick={() => handleEliminar(t.id)} style={smallBtnStyle('#ef4444')}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Control del Modo Admin al final */}
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
            <p style={{ fontSize: '12px', color: '#22c55e' }}>✅ Modo Administrador Activo (Edición y Eliminación Habilitadas)</p>
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