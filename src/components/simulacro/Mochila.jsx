// src/components/simulacro/Mochila.jsx
import React, { useState, useEffect } from 'react';
import { OBJETOS_MOCHILA } from '../../data/preguntas';

export default function Mochila({ alCompletar, dificultad }) {
  const [objetosDisponibles, setObjetosDisponibles] = useState([]);
  const [mochila, setMochila] = useState([]);
  const [tiempo, setTiempo] = useState(20);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState(null);

  const getTiempoLimite = () => {
    if (dificultad === 'facil') return 25;
    if (dificultad === 'medio') return 18;
    return 12;
  };

  useEffect(() => {
    setObjetosDisponibles(OBJETOS_MOCHILA);
    setTiempo(getTiempoLimite());

    const timer = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          evaluarMochilaAuto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dificultad]);

  // Manejo de Drag and Drop
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (finalizado) return;
    const dataText = e.dataTransfer.getData('text/plain');
    if (!dataText) return;

    const item = JSON.parse(dataText);
    if (!mochila.find((i) => i.id === item.id)) {
      setMochila((prev) => [...prev, item]);
      setObjetosDisponibles((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  // Evaluar selección
  const evaluarMochilaAuto = () => {
    setFinalizado(true);
    const correctos = mochila.filter((i) => i.esCorrecto).length;
    const incorrectos = mochila.filter((i) => !i.esCorrecto).length;
    
    const exito = correctos >= 4 && incorrectos === 0;
    setResultado({ correctos, incorrectos, exito });
    alCompletar(exito);
  };

  return (
    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px' }}>
      <h3>🎒 Reto: Armar la Mochila de Emergencia (72 Horas)</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>
        Arrastra los objetos indispensables dentro de la mochila antes de que venza el tiempo.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <span>⏱️ Tiempo restante: <strong>{tiempo}s</strong></span>
        <span>🎒 Objetos en mochila: {mochila.length}</span>
      </div>

      <div className="grid-mochila">
        {/* Zona 1: Objetos Disponibles */}
        <div className="caja-drag">
          <h4>📦 Elementos Disponibles</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            {objetosDisponibles.map((item) => (
              <div
                key={item.id}
                draggable={!finalizado}
                onDragStart={(e) => handleDragStart(e, item)}
                className="item-draggable"
              >
                {item.nombre}
              </div>
            ))}
          </div>
        </div>

        {/* Zona 2: Contenedor Mochila */}
        <div 
          className="caja-drop"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h4>🎒 Tu Mochila de Emergencia</h4>
          {mochila.length === 0 && (
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '20px' }}>
              Arrastra aquí los artículos vitales...
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            {mochila.map((item) => (
              <div key={item.id} className="item-draggable dentro">
                {item.nombre}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!finalizado ? (
        <button 
          className="btn-pestana activa" 
          style={{ marginTop: '15px', width: '100%' }}
          onClick={evaluarMochilaAuto}
        >
          Confirmar Mochila
        </button>
      ) : (
        <div className={`caja-explicacion ${resultado?.exito ? 'exito' : 'error'}`} style={{ marginTop: '15px' }}>
          <h4>{resultado?.exito ? '✅ ¡Mochila Óptima para Sobrevivencia!' : '❌ Selección Deficiente'}</h4>
          <p style={{ marginTop: '5px' }}>
            Elegiste {resultado?.correctos} objetos correctos y {resultado?.incorrectos} innecesarios/pesados.
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '5px', color: '#cbd5e1' }}>
            Explicación: La mochila debe pesar menos del 10% del peso corporal y contener insumos básicos de supervivencia (agua, enlatados, radio, botiquín).
          </p>
        </div>
      )}
    </div>
  );
}