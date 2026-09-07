import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [temblores, setTemblores] = useState([])
  const [editandoId, setEditandoId] = useState(null)
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
        alert('¡Registro guardado exitosamente!')
      }
      limpiarFormulario()
      obtenerTemblores()
    } catch (error) {
      console.error('Error al guardar:', error)
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
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h1>{editandoId ? 'Editar Registro de Sismo' : 'Reportar un Sismo'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input name="nombre" value={formData.nombre} placeholder="Tu Nombre / Reportante" onChange={handleChange} required />
        <input name="magnitud" value={formData.magnitud} type="number" step="0.1" placeholder="Magnitud" onChange={handleChange} required />
        <input name="profundidad" value={formData.profundidad} type="number" step="0.1" placeholder="Profundidad (km)" onChange={handleChange} required />
        <input name="rango" value={formData.rango} type="number" placeholder="Rango" onChange={handleChange} required />
        <input name="lugar" value={formData.lugar} placeholder="Lugar / Municipio" onChange={handleChange} required />
        <input name="area" value={formData.area} placeholder="Área / Departamento" onChange={handleChange} required />
        <input name="fecha" value={formData.fecha} type="date" onChange={handleChange} required />
        <input name="hora" value={formData.hora} type="time" onChange={handleChange} required />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: editandoId ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {editandoId ? 'Guardar Cambios' : 'Enviar Reporte'}
          </button>
          {editandoId && (
            <button type="button" onClick={limpiarFormulario} style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Historial de Sismos Reportados</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {temblores.map((t) => (
          <li key={t.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{t.lugar} ({t.area})</strong> - Mag: {t.magnitud} M | Prof: {t.profundidad} km <br />
              <small>Reportado por: {t.nombre} | Fecha: {t.fecha} {t.hora}</small>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => handleEditar(t)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
              <button onClick={() => handleEliminar(t.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App