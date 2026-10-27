import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Corregir íconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Recibimos `tabActiva` para detectar cuándo la pestaña Monitoreo se hace visible
const MapaRuta = ({ tabActiva }) => {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [distancia, setDistancia] = useState(null);
  const [puntos, setPuntos] = useState({ puntoA: null, puntoB: null });

  // 1. Efecto para inicializar el mapa nativo de Leaflet
  useEffect(() => {
    // Inicializar Mapa centrado (Coordenadas de Popayán por defecto)
    const map = L.map('mapa-indrive').setView([2.4419, -76.6063], 14);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Obtener Geolocalización actual (Punto A)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latA = position.coords.latitude;
          const lngA = position.coords.longitude;
          const userLocation = L.latLng(latA, lngA);

          map.setView(userLocation, 15);
          setPuntos((prev) => ({ ...prev, puntoA: userLocation }));
        },
        () => console.warn('Geolocalización rechazada, usando punto por defecto.')
      );
    }

    // Capturar clics para definir Punto A y Punto B
    let tempA = null;
    let tempB = null;

    map.on('click', (e) => {
      if (!tempA) {
        tempA = e.latlng;
        setPuntos((prev) => ({ ...prev, puntoA: tempA }));
      } else if (!tempB) {
        tempB = e.latlng;
        setPuntos((prev) => ({ ...prev, puntoB: tempB }));

        // Trazar Ruta estilo inDrive
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }

        const routingControl = L.Routing.control({
          waypoints: [tempA, tempB],
          lineOptions: {
            styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }], // Azul estilo inDrive
          },
          addWaypoints: true,
          draggableWaypoints: true,
          fitSelectedRoutes: true,
          show: false, // Oculta el panel con texto de instrucciones
        }).addTo(map);

        // Escuchar evento cuando la ruta se calcula para medir la distancia
        routingControl.on('routesfound', (event) => {
          const routes = event.routes;
          const summary = routes[0].summary;
          const distanciaKm = (summary.totalDistance / 1000).toFixed(2);
          setDistancia(distanciaKm);
        });

        routingControlRef.current = routingControl;
      } else {
        // Reiniciar puntos al hacer un tercer clic
        tempA = e.latlng;
        tempB = null;
        setDistancia(null);
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
        setPuntos({ puntoA: tempA, puntoB: null });
      }
    });

    return () => map.remove();
  }, []);

  // 2. EFECTO CLAVE: Forzar redibujado de Leaflet al cambiar a la pestaña 'monitoreo'
  useEffect(() => {
    if (tabActiva === 'monitoreo' && mapRef.current) {
      // Pequeño timeout para permitir que el DOM renderice el contenedor antes de redibujar
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [tabActiva]);

  return (
    <div className="tarjeta">
      <h2>Georreferenciación y Medición de Ruta</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        {!puntos.puntoA && 'Haz clic en el mapa para marcar el Punto A (Origen)'}
        {puntos.puntoA && !puntos.puntoB && 'Haz clic en el mapa para marcar el Punto B (Destino)'}
        {puntos.puntoA && puntos.puntoB && 'Ruta calculada. Haz clic de nuevo para reiniciar.'}
      </p>

      {distancia && (
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', margin: '10px 0' }}>
          <strong style={{ color: '#22c55e' }}>📍 Distancia total: {distancia} km</strong>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div id="mapa-indrive" style={{ height: '400px', width: '100%', borderRadius: '8px' }}></div>
    </div>
  );
};

export default MapaRuta;