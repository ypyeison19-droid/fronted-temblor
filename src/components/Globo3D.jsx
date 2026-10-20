import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';

// Coordenadas por defecto (Popayán / Colombia) si la alerta no incluye lat/lng
const COORD_DEFAULT = { lat: 2.4448, lng: -76.6147 };

export default function Globo3D({ alertas = [] }) {
  const globeEl = useRef();

  // Enfocar la cámara cerca de Colombia al cargar
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 4.5709, lng: -74.2973, altitude: 2.0 }, 1000);
    }
  }, []);

  // Formatear las alertas para enviarlas como puntos en el globo 3D
  const gData = alertas.map((item) => ({
    lat: item.latitud ? parseFloat(item.latitud) : COORD_DEFAULT.lat,
    lng: item.longitud ? parseFloat(item.longitud) : COORD_DEFAULT.lng,
    size: 0.5,
    color: item.tipo?.includes('Sismo') ? '#ef4444' : '#f59e0b',
    label: `${item.nombre || 'Alerta'}: ${item.tipo || 'Emergencia'}`
  }));

  return (
    <div className="tarjeta" style={{ textAlign: 'center', overflow: 'hidden', padding: '15px' }}>
      <h2 style={{ marginBottom: '10px' }}>🌍 Monitoreo Global de Alertas 3D</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>
        Gira y haz zoom en el planeta para explorar las zonas de impacto en tiempo real.
      </p>
      
      <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#090d16' }}>
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={gData}
          pointColor="color"
          pointAltitude={0.05}
          pointRadius={0.6}
          pointsMerge={false}
          pointPulseRadius={2.0}
          pointPropagationSpeed={2.0}
          pointRepeatPeriod={1200}
          pointLabel="label"
          width={700}
          height={400}
        />
      </div>
    </div>
  );
}