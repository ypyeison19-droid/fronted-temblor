// src/components/simulacro/Juego.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ESCENARIOS_SIMULACRO } from '../../data/preguntas';

export default function Juego({ dificultad, alResponder, silenciado, toggleSilenciar }) {
  const [escenarioActual, setEscenarioActual] = useState(0);
  const [tiempo, setTiempo] = useState(10);
  const [bloqueado, setBloqueado] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  
  const audioCtxRef = useRef(null);
  const osciladorRef = useRef(null);

  // Determina el tiempo límite según dificultad
  const getTiempoLimite = () => {
    if (dificultad === 'facil') return 12;
    if (dificultad === 'medio') return 10;
    return 6; // Dificultad difícil
  };

  const escenario = ESCENARIOS_SIMULACRO[escenarioActual];

  // Sintetizador de audio con Web Audio API para el sonido de temblor
  const reproducirSonidoSismo = () => {
    if (silenciado) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, ctx.currentTime); // Frecuencia baja (retumbo)
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osciladorRef.current = osc;
    } catch (e) {
      console.warn("Audio no soportado en este navegador");
    }
  };

  const detenerSonidoSismo = () => {
    if (osciladorRef.current) {
      try {
        osciladorRef.current.stop();
      } catch (e) {}
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
    }
  };

  // Inicializa temporizador y sonido por escenario
  useEffect(() => {
    setTiempo(getTiempoLimite());
    setBloqueado(false);
    setRetroalimentacion(null);
    reproducirSonidoSismo();

    const interval = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          manejarTiempoAgotado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      detenerSonidoSismo();
    };
  }, [escenarioActual, dificultad]);

  const manejarTiempoAgotado = () => {
    setBloqueado(true);
    detenerSonidoSismo();
    setRetroalimentacion({
      correcta: false,
      texto: "⏱️ ¡Tiempo agotado! Durante un sismo debes reaccionar en segundos."
    });
    alResponder(false);
  };

  const seleccionarOpcion = (opcion) => {
    if (bloqueado) return;
    setBloqueado(true);
    detenerSonidoSismo();

    setRetroalimentacion({
      correcta: opcion.correcta,
      texto: opcion.expl
    });

    alResponder(opcion.correcta);
  };

  const siguienteEscenario = () => {
    if (escenarioActual + 1 < ESCENARIOS_SIMULACRO.length) {
      setEscenarioActual((prev) => prev + 1);
    } else {
      setEscenarioActual(0); // Reiniciar ronda de escenarios
    }
  };

  return (
    <div className={`simulador-sismo ${!bloqueado ? 'animacion-temblor' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span className="badge-rojo">SÍSMICO EN CURSO ({escenario.magnitud})</span>
        <button className="btn-pestana" onClick={toggleSilenciar}>
          {silenciado ? '🔇 Sonido Apagado' : '🔊 Sonido Sismo On'}
        </button>
      </div>

      <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>{escenario.titulo}</h3>
      
      {/* Barra de Tiempo */}
      <div style={{ width: '100%', background: '#1e293b', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '15px' }}>
        <div style={{ 
          width: `${(tiempo / getTiempoLimite()) * 100}%`, 
          background: tiempo <= 3 ? '#ef4444' : '#38bdf8', 
          height: '100%', 
          transition: 'width 1s linear' 
        }}></div>
      </div>

      <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '15px' }}>
        ⏱️ Tiempo para decidir: <strong>{tiempo}s</strong>
      </p>

      {/* Opciones de Acción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {escenario.opciones.map((op, idx) => (
          <button
            key={idx}
            disabled={bloqueado}
            onClick={() => seleccionarOpcion(op)}
            className="btn-opcion-simulacro"
          >
            {op.texto}
          </button>
        ))}
      </div>

      {/* Explicación / Retroalimentación */}
      {retroalimentacion && (
        <div className={`caja-explicacion ${retroalimentacion.correcta ? 'exito' : 'error'}`}>
          <p><strong>{retroalimentacion.correcta ? '✅ ¡Respuesta Correcta!' : '❌ Acción Incorrecta'}</strong></p>
          <p style={{ marginTop: '5px' }}>{retroalimentacion.texto}</p>
          <button className="btn-pestana activa" style={{ marginTop: '10px' }} onClick={siguienteEscenario}>
            Siguiente Escenario ➡️
          </button>
        </div>
      )}
    </div>
  );
}