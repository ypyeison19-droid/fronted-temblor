import React, { useState, useEffect } from 'react';
import MapaRuta from './components/MapaRuta';

// Reemplaza la línea de API_URL en src/App.jsx por esta:
const API_URL = "https://sismos-backend-app.onrender.com/api/temblor/";
function App() {
  const [alertas, setAlertas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Sismo / Temblor',
    descripcion: '',
    foto: null,
    documento: null,
    audio: null,
    video: null,
  });

  const [subiendo, setSubiendo] = useState(false);

  // Cargar historial de alertas desde Onrender
  const obtenerAlertas = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setAlertas(data);
      }
    } catch (err) {
      console.error('Error cargando historial de alertas:', err);
    }
  };

  useEffect(() => {
    obtenerAlertas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('tipo', formData.tipo);
    data.append('descripcion', formData.descripcion);
    if (formData.foto) data.append('foto', formData.foto);
    if (formData.documento) data.append('documento', formData.documento);
    if (formData.audio) data.append('audio', formData.audio);
    if (formData.video) data.append('video', formData.video);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        alert('Reporte e información subida con éxito');
        setFormData({
          nombre: '',
          tipo: 'Sismo / Temblor',
          descripcion: '',
          foto: null,
          documento: null,
          audio: null,
          video: null,
        });
        e.target.reset();
        obtenerAlertas(); // Recargar el historial tras publicar
      } else {
        alert('Ocurrió un problema al enviar la información.');
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="container">
      <header className="header-app">
        <span className="badge-rojo">🚨 RED DE ALERTAS Y EMERGENCIAS COMUNITARIAS</span>
        <h1>Sistema de Alertas Tempranas E.M.</h1>
        <p className="subtitulo">Informa sobre eventos de riesgo, ubícalos en el mapa y adjunta evidencias.</p>
      </header>

      {/* Componente de Geolocalización y Medición de Ruta */}
      <MapaRuta />

      {/* Formulario de Reportes */}
      <section className="tarjeta">
        <h2>📢 Reportar un Evento de Riesgo</h2>
        <form onSubmit={handleSubmit} className="form-alerta">
          <div className="campo-form">
            <label>Nombre del Reportante:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ej. Estiben Muñoz"
            />
          </div>

          <div className="campo-form">
            <label>Tipo de Evento / Emergencia:</label>
            <select name="tipo" value={formData.tipo} onChange={handleInputChange}>
              <option value="Sismo / Temblor">🚨 Sismo / Temblor</option>
              <option value="Inundación">🌊 Inundación</option>
              <option value="Incendio">🔥 Incendio</option>
              <option value="Deslizamiento">⛰️ Deslizamiento</option>
            </select>
          </div>

          <div className="campo-form">
            <label>Descripción / Detalle:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              placeholder="Detalla los sucesos de la emergencia..."
            />
          </div>

          <div className="grid-archivos">
            <div className="campo-form">
              <label>Foto:</label>
              <input type="file" name="foto" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="campo-form">
              <label>Documento:</label>
              <input type="file" name="documento" onChange={handleFileChange} />
            </div>

            <div className="campo-form">
              <label>Audio:</label>
              <input type="file" name="audio" accept="audio/*" onChange={handleFileChange} />
            </div>

            <div className="campo-form">
              <label>Video:</label>
              <input type="file" name="video" accept="video/*" onChange={handleFileChange} />
            </div>
          </div>

          <button type="submit" className="btn-subir" disabled={subiendo}>
            {subiendo ? 'Publicando...' : 'Publicar Alerta con Foto y Mapa'}
          </button>
        </form>
      </section>

      {/* Documentos */}
      <section className="tarjeta">
        <h2>📂 Documentos de Evacuación</h2>
        <div className="contenedor-botones-docs">
          <a href="/archivos/manual.pdf" className="btn-doc" target="_blank" rel="noreferrer">Manual de Evacuación</a>
          <a href="/archivos/manual.zip" className="btn-doc" download>Descargar Manual (.zip)</a>
          <a href="/archivos/extintores.csv" className="btn-doc" download>Descargar CSV Extintores</a>
          <a href="/archivos/ruta.gpx" className="btn-doc" download>Descargar GPX Ruta</a>
        </div>
      </section>

      {/* Historial de Alertas en Tiempo Real */}
      <section className="tarjeta">
        <h2>📑 Historial de Alertas Publicadas ({alertas.length})</h2>
        <div className="lista-historial">
          {alertas.length > 0 ? (
            alertas.map((item) => (
              <div key={item.id} className="item-alerta">
                <div className="header-alerta">
                  <strong>🚨 {item.nombre}</strong>
                  <span className="badge-tipo">{item.tipo || 'Sismo'}</span>
                </div>
                <p>{item.descripcion}</p>
                {item.foto && <img src={item.foto} alt="Evidencia" className="img-evidencia" />}
                <small className="fecha-alerta">Reportado el: {new Date(item.fecha || Date.now()).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p style={{ color: '#94a3b8' }}>No hay alertas registradas aún.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;