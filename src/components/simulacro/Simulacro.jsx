// src/components/simulacro/Simulacro.jsx
import React, { useState, useEffect } from 'react';
import Juego from './Juego';
import Mochila from './Mochila';
import Trivia from './Trivia';

export default function Simulacro() {
  const [subModulo, setSubModulo] = useState('simulador'); // 'simulador' | 'mochila' | 'trivia'
  const [dificultad, setDificultad] = useState('medio'); // 'facil' | 'medio' | 'dificil'
  const [puntos, setPuntos] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [racha, setRacha] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [silenciado, setSilenciado] = useState(false);

  // Cargar mejor puntaje desde localStorage
  useEffect(() => {
    const record = localStorage.getItem('simulacro_mejor_puntaje');
    if (record) {
      setMejorPuntaje(parseInt(record, 10));
    }
  }, []);

  // Procesar respuestas y actualizar puntuación / vidas
  const procesarRespuesta = (esCorrecta) => {
    if (juegoTerminado) return;

    if (esCorrecta) {
      const bonoMultiplicador = dificultad === 'dificil' ? 300 : dificultad === 'medio' ? 200 : 100;
      const nuevoPuntaje = puntos + bonoMultiplicador + (racha * 50);
      setPuntos(nuevoPuntaje);
      setRacha((prev) => prev + 1);

      if (nuevoPuntaje > mejorPuntaje) {
        setMejorPuntaje(nuevoPuntaje);
        localStorage.setItem('simulacro_mejor_puntaje', nuevoPuntaje.toString());
      }
    } else {
      setRacha(0);
      setVidas((prev) => {
        const nuevasVidas = prev - 1;
        if (nuevasVidas <= 0) {
          setJuegoTerminado(true);
        }
        return nuevasVidas;
      });
    }
  };

  const reiniciarJuego = () => {
    setPuntos(0);
    setVidas(3);
    setRacha(0);
    setJuegoTerminado(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Marcador Superior de Estado */}
      <div className="panel-marcador">
        <div>
          <span>🏆 Puntos: <strong>{puntos}</strong></span>
          <span style={{ marginLeft: '15px', color: '#eab308' }}>⭐ Récord: <strong>{mejorPuntaje}</strong></span>
        </div>
        <div>
          <span>❤️ Vidas: {'❤️'.repeat(Math.max(0, vidas))}</span>
          <span style={{ marginLeft: '15px', color: '#38bdf8' }}>🔥 Racha: <strong>{racha}</strong></span>
        </div>
      </div>

      {/* Selector de Dificultad y Submódulos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-pestana ${subModulo === 'simulador' ? 'activa' : ''}`}
            onClick={() => setSubModulo('simulador')}
          >
            🚨 Simulador Sismo
          </button>
          <button 
            className={`btn-pestana ${subModulo === 'mochila' ? 'activa' : ''}`}
            onClick={() => setSubModulo('mochila')}
          >
            🎒 Mochila 72h
          </button>
          <button 
            className={`btn-pestana ${subModulo === 'trivia' ? 'activa' : ''}`}
            onClick={() => setSubModulo('trivia')}
          >
            🎓 Trivia Sísmica
          </button>
        </div>

        <div>
          <select 
            value={dificultad} 
            onChange={(e) => setDificultad(e.target.value)}
            style={{ padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
          >
            <option value="facil">🟢 Dificultad: Fácil</option>
            <option value="medio">🟡 Dificultad: Media</option>
            <option value="dificil">🔴 Dificultad: Difícil</option>
          </select>
        </div>
      </div>

      {/* Pantalla Final si pierde las 3 vidas */}
      {juegoTerminado ? (
        <div style={{ background: '#0f172a', padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>💥 Simulacro Finalizado</h2>
          <p style={{ marginTop: '10px', color: '#cbd5e1' }}>Has agotado tus vidas de emergencia.</p>
          <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Puntaje Obtenido: <strong>{puntos} pts</strong></p>
          <button 
            className="btn-pestana activa" 
            style={{ marginTop: '20px', padding: '12px 24px' }}
            onClick={reiniciarJuego}
          >
            🔄 Intentar de Nuevo
          </button>
        </div>
      ) : (
        /* Render de Submódulo */
        <>
          {subModulo === 'simulador' && (
            <Juego 
              dificultad={dificultad}
              alResponder={procesarRespuesta}
              silenciado={silenciado}
              toggleSilenciar={() => setSilenciado(!silenciado)}
            />
          )}

          {subModulo === 'mochila' && (
            <Mochila 
              dificultad={dificultad}
              alCompletar={procesarRespuesta}
            />
          )}

          {subModulo === 'trivia' && (
            <Trivia 
              alResponder={procesarRespuesta}
            />
          )}
        </>
      )}
    </div>
  );
}