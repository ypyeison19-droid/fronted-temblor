// src/components/simulacro/Trivia.jsx
import React, { useState } from 'react';
import { PREGUNTAS_TRIVIA } from '../../data/preguntas';

export default function Trivia({ alResponder }) {
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [respondido, setRespondido] = useState(false);

  const pregunta = PREGUNTAS_TRIVIA[indicePregunta];

  const seleccionarRespuesta = (index) => {
    if (respondido) return;
    setOpcionSeleccionada(index);
    setRespondido(true);

    const esCorrecta = index === pregunta.correcta;
    alResponder(esCorrecta);
  };

  const siguientePregunta = () => {
    setOpcionSeleccionada(null);
    setRespondido(false);
    if (indicePregunta + 1 < PREGUNTAS_TRIVIA.length) {
      setIndicePregunta((prev) => prev + 1);
    } else {
      setIndicePregunta(0); // Reiniciar ciclo
    }
  };

  return (
    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', marginBottom: '10px' }}>
        <span>🎓 Conocimiento Técnico y Prevención</span>
        <span>Pregunta {indicePregunta + 1} / {PREGUNTAS_TRIVIA.length}</span>
      </div>

      <h3 style={{ marginBottom: '15px', color: '#f8fafc' }}>{pregunta.pregunta}</h3>

      {/* Opciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pregunta.opciones.map((op, idx) => {
          let claseBoton = 'btn-opcion-simulacro';
          if (respondido) {
            if (idx === pregunta.correcta) claseBoton += ' correcta';
            else if (idx === opcionSeleccionada) claseBoton += ' incorrecta';
          }

          return (
            <button
              key={idx}
              disabled={respondido}
              onClick={() => seleccionarRespuesta(idx)}
              className={claseBoton}
            >
              {op}
            </button>
          );
        })}
      </div>

      {/* Explicación Educativa */}
      {respondido && (
        <div className={`caja-explicacion ${opcionSeleccionada === pregunta.correcta ? 'exito' : 'error'}`}>
          <p>
            <strong>
              {opcionSeleccionada === pregunta.correcta ? '✅ ¡Correcto!' : '❌ Respuesta Incorrecta'}
            </strong>
          </p>
          <p style={{ marginTop: '5px', fontSize: '0.9rem' }}>{pregunta.explicacion}</p>
          <button className="btn-pestana activa" style={{ marginTop: '10px' }} onClick={siguientePregunta}>
            Siguiente Pregunta ➡️
          </button>
        </div>
      )}
    </div>
  );
}