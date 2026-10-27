// src/components/Guia.jsx
import React, { useState } from 'react';

// Datos de los protocolos de actuación en emergencias sísmicas
const PROTOCOLOS = [
  {
    id: 'antes',
    fase: '🛡️ ANTES del Sismo (Prevención)',
    color: '#38bdf8',
    pasos: [
      'Identifica y asegura objetos pesados que puedan caer (cuadros, estantes, espejos).',
      'Define con tu familia un punto de encuentro seguro fuera de la edificación.',
      'Manten a la mano la Mochila de Emergencia con insumos para 72 horas.',
      'Conoce la ubicación exacta y cómo cerrar las llaves de paso de gas, agua y el interruptor eléctrico.'
    ]
  },
  {
    id: 'durante',
    fase: '🚨 DURANTE el Sismo (Acción Inmediata)',
    color: '#ef4444',
    pasos: [
      '¡Agáchate, Cúbrete y Sujétate! Es la técnica universal de protección.',
      'Aléjate de ventanas, fachadas, espejos y objetos de vidrio que puedan estallar.',
      'NO uses ascensores ni intentes correr despavorido por las escaleras.',
      'Si estás conduciendo, detén el vehículo en un lugar seguro lejos de puentes, postes y árboles.'
    ]
  },
  {
    id: 'despues',
    fase: '🌱 DESPUÉS del Sismo (Respuesta)',
    color: '#10b981',
    pasos: [
      'Verifica si hay lesionados antes de moverte; aplica primeros auxilios si es seguro.',
      'Revisa si hay olor a gas o fugas de agua. NO enciendas fósforos ni interruptores si sospechas una fuga.',
      'Prepárate para las réplicas; suelen ser de menor magnitud pero pueden colapsar estructuras dañadas.',
      'Sintoniza la radio o canales oficiales para recibir instrucciones de las autoridades.'
    ]
  }
];

// Datos de las 8 curiosidades sísmicas para las tarjetas de volteo
const CURIOSIDADES = [
  {
    id: 1,
    titulo: 'El Terremoto más Potente',
    frente: '¿Sabías cuál ha sido el terremoto de mayor magnitud registrado en la historia?',
    reverso: 'Ocurrió en Valdivia (Chile) en 1960. Tuvo una magnitud de 9.5 M_w y liberó la energía equivalente a 20,000 bombas atómicas.'
  },
  {
    id: 2,
    titulo: '¿Los Animales lo Presienten?',
    frente: '¿Realmente los animales pueden predecir un temblor antes que los humanos?',
    reverso: 'Sí. Detectan las ondas P (secundarias/invisibles) que viajan más rápido que las ondas S percibidas por las personas.'
  },
  {
    id: 3,
    titulo: 'Duración Real de un Sismo',
    frente: '¿Cuánto tiempo dura habitualmente la sacudida principal de un temblor?',
    reverso: 'Rara vez supera los 30 a 60 segundos. Aunque la percepción psicológica hace que parezca durar mucho más tiempo.'
  },
  {
    id: 4,
    titulo: 'Sismos en la Luna',
    frente: '¿Ocurren terremotos fuera de nuestro planeta Tierra?',
    reverso: '¡Sí! Los llamados "Moonquakes" ocurren en la Luna debido a la gravedad terrestre y la contracción por enfriamiento.'
  },
  {
    id: 5,
    titulo: 'Millones de Sismos al Año',
    frente: '¿Cuántos temblores ocurren en el planeta cada día sin que los sintamos?',
    reverso: 'Se estiman más de 500,000 sismos detectables al año en todo el mundo. Cerca de 100,000 son percibidos por las personas.'
  },
  {
    id: 6,
    titulo: 'El Rayo Sísmico (Luces)',
    frente: '¿Por qué a veces el cielo se ilumina de colores durante un gran terremoto?',
    reverso: 'Se debe a la triboluminiscencia: la enorme fricción de rocas cargadas de cuarzo genera campos eléctricos que ionizan el aire.'
  },
  {
    id: 7,
    titulo: 'El Edificio Antisísmico',
    frente: '¿Cómo evita el rascacielos Taipei 101 colapsar ante terremotos y tifones?',
    reverso: 'Tiene un péndulo de acero gigantesco de 660 toneladas colgado en su interior que actúa como amortiguador de masa.'
  },
  {
    id: 8,
    titulo: 'Epicentro vs Hipocentro',
    frente: '¿Es lo mismo el epicentro que el hipocentro de un sismo?',
    reverso: 'No. El hipocentro es el punto de ruptura DENTRO de la Tierra. El epicentro es el punto justo encima sobre la superficie.'
  }
];

export default function Guia() {
  // Estado para controlar qué tarjeta del protocolo (Antes/Durante/Después) está abierta
  const [seccionAbierta, setSeccionAbierta] = useState('durante');

  // Estado para controlar las tarjetas de curiosidades volteadas
  const [volteadas, setVolteadas] = useState({});

  const toggleSeccion = (id) => {
    setSeccionAbierta(seccionAbierta === id ? null : id);
  };

  const toggleVolteo = (id) => {
    setVolteadas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 1. Recuadro Destacado: Protocolo Universal */}
      <section className="banner-proteccion">
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧘‍♂️ 🛡️ 🪑</div>
        <h2 style={{ fontSize: '1.8rem', color: '#38bdf8', marginBottom: '10px' }}>
          AGÁCHATE, CÚBRETE Y SUJÉTATE
        </h2>
        <p style={{ color: '#cbd5e1', maxWidth: '800px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Ante el primer indicio de sacudida sísmica, <strong>agáchate</strong> sobre tus manos y rodillas, 
          <strong> cúbrete</strong> la cabeza y el cuello debajo de un mueble o mesa resistente, y 
          <strong> sujétate</strong> fuertemente de una de sus patas hasta que cese el movimiento.
        </p>
      </section>

      {/* 2. Tarjetas Desplegables (Acordeón) Antes / Durante / Después */}
      <section>
        <h2 style={{ color: '#f8fafc', marginBottom: '15px' }}>📋 Protocolos de Actuación Sísmica</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PROTOCOLOS.map((item) => {
            const estaAbierta = seccionAbierta === item.id;
            return (
              <div 
                key={item.id} 
                style={{
                  background: '#0f172a',
                  borderRadius: '10px',
                  border: `1px solid ${estaAbierta ? item.color : '#1e293b'}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Cabecera del Acordeón */}
                <button
                  onClick={() => toggleSeccion(item.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: item.color,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{item.fase}</span>
                  <span style={{ fontSize: '1.2rem' }}>{estaAbierta ? '➖' : '➕'}</span>
                </button>

                {/* Contenido desplegable */}
                {estaAbierta && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #1e293b' }}>
                    <ul style={{ marginTop: '15px', paddingLeft: '20px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.pasos.map((paso, idx) => (
                        <li key={idx} style={{ lineHeight: '1.5' }}>{paso}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Rejilla de 8 Tarjetas Curiosas Interactivas (Flip Cards) */}
      <section>
        <h2 style={{ color: '#f8fafc', marginBottom: '10px' }}>💡 ¿Sabías qué? (Curiosidades Sísmicas)</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
          Haz clic sobre cualquier tarjeta para voltearla y descubrir el dato científico.
        </p>

        <div className="grid-curiosidades">
          {CURIOSIDADES.map((c) => {
            const estaVolteada = volteadas[c.id];
            return (
              <div 
                key={c.id} 
                className={`tarjeta-flip ${estaVolteada ? 'volteada' : ''}`}
                onClick={() => toggleVolteo(c.id)}
              >
                <div className="tarjeta-flip-inner">
                  {/* Frente de la tarjeta */}
                  <div className="tarjeta-flip-front">
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {c.titulo}
                    </span>
                    <p style={{ marginTop: '12px', fontSize: '1rem', color: '#f8fafc', fontWeight: '500' }}>
                      {c.frente}
                    </p>
                    <span style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                      🔄 Toca para voltear
                    </span>
                  </div>

                  {/* Reverso de la tarjeta */}
                  <div className="tarjeta-flip-back">
                    <span style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      Dato Científico
                    </span>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      {c.reverso}
                    </p>
                    <span style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#38bdf8' }}>
                      ↩️ Volver al frente
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}