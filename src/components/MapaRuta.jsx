// src/components/MapaRuta.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- MARCADORES PERSONALIZADOS CON L.divIcon (Sin íconos por defecto) ---
const crearIconoHtml = (emoji, colorBorde = '#2563eb', sombra = 'rgba(37, 99, 235, 0.4)') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: #0f172a;
        border: 2px solid ${colorBorde};
        box-shadow: 0 0 10px ${sombra};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const iconoOrigen = crearIconoHtml('📍', '#38bdf8', 'rgba(56, 189, 248, 0.5)');
const iconoDestino = crearIconoHtml('🎯', '#ef4444', 'rgba(239, 68, 68, 0.5)');

// --- FÓRMULA DE HAVERSINE (DISTANCIA EN LÍNEA RECTA DE RESPALDO) ---
const calcularHaversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapaRuta = ({ tabActiva }) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markerOrigenRef = useRef(null);
  const markerDestinoRef = useRef(null);
  const circlePrecisiónRef = useRef(null);

  // Referencias para control de estado sin re-renders en loops
  const watchIdRef = useRef(null);
  const ultimaPosicionCalculadaRef = useRef(null);
  const ultimoCalculoTiempoRef = useRef(0);

  // Estados de interfaz y ubicación
  const [siguiendoUbicacion, setSiguiendoUbicacion] = useState(false);
  const [modoTransporte, setModoTransporte] = useState('driving'); // driving (carro/moto), walking
  const [puntoA, setPuntoA] = useState(null); // Ubicación Origen (lat, lng)
  const [puntoB, setPuntoB] = useState(null); // Ubicación Destino (lat, lng)
  
  // Métricas de Ruta
  const [infoRuta, setInfoRuta] = useState(null); // { distanciaKm, tiempoMin, esHaversine }
  const [errorGps, setErrorGps] = useState(null);

  // Buscador Nominatim
  const [busquedaText, setBusquedaText] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  // 1. INICIALIZAR MAPA Y CAPAS
  useEffect(() => {
    const map = L.map('mapa-indrive-container', {
      center: [2.4419, -76.6063], // Popayán por defecto
      zoom: 14,
      zoomControl: false,
    });
    mapRef.current = map;

    // Controles de zoom abajo a la derecha
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Definición de Capas de Mapa (LayersControl)
    const capaOscuro = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; <a href="https://carto.com/">CARTO</a>' }
    );

    const capaCalles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors' }
    );

    const capaSatelite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' }
    );

    const capaTopografico = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)' }
    );

    // Añadir capa oscura por defecto
    capaOscuro.addTo(map);

    // Control de Capas
    const baseMaps = {
      "🌙 Oscuro (CARTO)": capaOscuro,
      "🗺️ Calles (OpenStreetMap)": capaCalles,
      "🛰️ Satélite (Esri)": capaSatelite,
      "⛰️ Topográfico (OpenTopoMap)": capaTopografico
    };
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    // Intentar geolocalización inicial de lectura rápida (getCurrentPosition)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          map.setView(latLng, 15);
          actualizarPuntoOrigen(latLng, pos.coords.accuracy);
        },
        (err) => manejarErrorGps(err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    // Evento Clic en el Mapa para Fijar Destino (Punto B)
    map.on('click', (e) => {
      fijarPuntoDestino(e.latlng);
    });

    // Limpieza al desmontar
    return () => {
      detenerWatchPosition();
      map.remove();
    };
  }, []);

  // 2. EFECTO: INVALIDATESIZE AL CAMBIAR DE PESTAÑA
  useEffect(() => {
    if (tabActiva === 'monitoreo' && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [tabActiva]);

  // 3. ACTUALIZAR MARCADOR ORIGEN (PUNTO A) Y CÍRCULO DE PRECISIÓN
  const actualizarPuntoOrigen = (latLng, accuracy = null) => {
    setPuntoA(latLng);

    if (!markerOrigenRef.current) {
      markerOrigenRef.current = L.marker(latLng, { icon: iconoOrigen })
        .bindPopup('<b>Tu Ubicación (Punto A)</b>')
        .addTo(mapRef.current);
    } else {
      markerOrigenRef.current.setLatLng(latLng);
    }

    // Círculo de precisión GPS
    if (accuracy) {
      if (!circlePrecisiónRef.current) {
        circlePrecisiónRef.current = L.circle(latLng, {
          radius: accuracy,
          color: '#38bdf8',
          fillColor: '#0284c7',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(mapRef.current);
      } else {
        circlePrecisiónRef.current.setLatLng(latLng);
        circlePrecisiónRef.current.setRadius(accuracy);
      }
    }
  };

  // 4. ACTUALIZAR MARCADOR DESTINO (PUNTO B)
  const fijarPuntoDestino = (latLng) => {
    setPuntoB(latLng);

    if (!markerDestinoRef.current) {
      markerDestinoRef.current = L.marker(latLng, { icon: iconoDestino })
        .bindPopup('<b>Destino Seleccionado (Punto B)</b>')
        .addTo(mapRef.current);
    } else {
      markerDestinoRef.current.setLatLng(latLng);
    }
  };

  // 5. SEGUIMIENTO GPS EN TIEMPO REAL (watchPosition)
  const iniciarWatchPosition = () => {
    if (!navigator.geolocation) {
      setErrorGps("Tu navegador no soporta geolocalización.");
      return;
    }

    setErrorGps(null);
    setSiguiendoUbicacion(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const nuevaUbicacion = L.latLng(pos.coords.latitude, pos.coords.longitude);
        actualizarPuntoOrigen(nuevaUbicacion, pos.coords.accuracy);

        // Si estamos siguiendo, centramos suavemente
        if (mapRef.current) {
          mapRef.current.panTo(nuevaUbicacion);
        }

        // Evaluar si corresponde recalcular la ruta (Umbral de 30m o 10s)
        if (puntoB) {
          evaluarRecalculoRuta(nuevaUbicacion);
        }
      },
      (err) => {
        manejarErrorGps(err);
        detenerWatchPosition();
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );

    watchIdRef.current = id;
  };

  const detenerWatchPosition = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSiguiendoUbicacion(false);
  };

  const manejarErrorGps = (err) => {
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setErrorGps("Permiso de GPS denegado. Por favor actívalo en tu navegador.");
        break;
      case err.POSITION_UNAVAILABLE:
        setErrorGps("La señal GPS no está disponible en este momento.");
        break;
      case err.TIMEOUT:
        setErrorGps("Se agotó el tiempo de espera para obtener tu ubicación GPS.");
        break;
      default:
        setErrorGps("Ocurrió un error desconocido al consultar el GPS.");
        break;
    }
  };

  const centrarEnMi = () => {
    if (puntoA && mapRef.current) {
      mapRef.current.flyTo(puntoA, 16, { animate: true, duration: 1 });
    } else {
      iniciarWatchPosition();
    }
  };

  // 6. CÁLCULO DE RUTA CON OSRM + RESPALDO HAVERSINE
  const evaluarRecalculoRuta = (nuevaPosOrigen) => {
    const ahora = Date.now();
    const tiempoTranscurridoSec = (ahora - ultimoCalculoTiempoRef.current) / 1000;

    let distMovidaMetros = 0;
    if (ultimaPosicionCalculadaRef.current) {
      distMovidaMetros = calcularHaversineKm(
        ultimaPosicionCalculadaRef.current.lat,
        ultimaPosicionCalculadaRef.current.lng,
        nuevaPosOrigen.lat,
        nuevaPosOrigen.lng
      ) * 1000;
    }

    // Umbral: Recalcula solo si se movió > 30m o pasaron 10 segundos
    if (!ultimaPosicionCalculadaRef.current || distMovidaMetros >= 30 || tiempoTranscurridoSec >= 10) {
      calcularRutaOSRM(nuevaPosOrigen, puntoB, modoTransporte);
    }
  };

  // Efecto cuando cambia puntoB o el modoTransporte
  useEffect(() => {
    if (puntoA && puntoB) {
      calcularRutaOSRM(puntoA, puntoB, modoTransporte);
    }
  }, [puntoB, modoTransporte]);

  const calcularRutaOSRM = async (origen, destino, modo) => {
    ultimoCalculoTiempoRef.current = Date.now();
    ultimaPosicionCalculadaRef.current = origen;

    // Perfil OSRM: driving (carro/moto), foot (a pie)
    const perfilOsrm = modo === 'walking' ? 'foot' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${perfilOsrm}/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fallo la respuesta del servidor OSRM');

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) throw new Error('Sin rutas disponibles');

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]); // GeoJSON [lng, lat] -> Leaflet [lat, lng]

      // Dibujar Polyline en el mapa
      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
      }

      const colorRuta = modo === 'walking' ? '#10b981' : '#2563eb';
      polylineRef.current = L.polyline(coords, {
        color: colorRuta,
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
      }).addTo(mapRef.current);

      // Calcular métricas
      const distKm = (route.distance / 1000).toFixed(2);
      const tiempoMin = Math.round(route.duration / 60);

      setInfoRuta({
        distanciaKm: distKm,
        tiempoMin: tiempoMin,
        esHaversine: false,
      });

    } catch (err) {
      console.warn("API de OSRM no disponible o bloqueada. Usando cálculo de línea recta (Haversine)...", err);
      
      // RESPALDO HAVERSINE
      const distDirectaKm = calcularHaversineKm(origen.lat, origen.lng, destino.lat, destino.lng).toFixed(2);
      
      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
      }

      // Dibujar línea punteada como indicativo de respaldo
      polylineRef.current = L.polyline([[origen.lat, origen.lng], [destino.lat, destino.lng]], {
        color: '#f59e0b',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(mapRef.current);

      // Estimar tiempo aprox según modo
      const velocidadPromedioKmH = modo === 'walking' ? 5 : 35;
      const tiempoEstimadoMin = Math.round((distDirectaKm / velocidadPromedioKmH) * 60);

      setInfoRuta({
        distanciaKm: distDirectaKm,
        tiempoMin: tiempoEstimadoMin,
        esHaversine: true,
      });
    }
  };

  // 7. BUSCADOR DE LUGARES CON DEBOUNCE (NOMINATIM)
  useEffect(() => {
    if (!busquedaText.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      ejecutarBusquedaNominatim(busquedaText);
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaText]);

  const ejecutarBusquedaNominatim = async (query) => {
    setBuscando(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const latLng = L.latLng(parseFloat(place.lat), parseFloat(place.lon));
        
        if (mapRef.current) {
          mapRef.current.flyTo(latLng, 16);
          fijarPuntoDestino(latLng);
        }
      }
    } catch (e) {
      console.error("Error al buscar en Nominatim:", e);
    } finally {
      setBuscando(false);
    }
  };

  // 8. LIMPIAR RUTA Y REINICIAR
  const reiniciarRuta = () => {
    setPuntoB(null);
    setInfoRuta(null);

    if (polylineRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (markerDestinoRef.current) {
      mapRef.current.removeLayer(markerDestinoRef.current);
      markerDestinoRef.current = null;
    }
  };

  return (
    <div className={`tarjeta-mapa-wrapper ${pantallaCompleta ? 'modo-fullscreen' : ''}`}>
      
      {/* Encabezado y Barra de Herramientas Superior */}
      <div className="mapa-header-tools">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>📍 Navegación y Medición de Ruta</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            {!puntoB 
              ? 'Toca cualquier punto en el mapa o busca un lugar para fijar tu destino.' 
              : 'Ruta trazada. Cambia el modo de transporte o limpia el destino.'}
          </p>
        </div>

        <button 
          className="btn-fullscreen-toggle"
          onClick={() => setPantallaCompleta(!pantallaCompleta)}
          title="Pantalla Completa"
        >
          {pantallaCompleta ? '📉 Salir Pantalla Completa' : '🖥️ Pantalla Completa'}
        </button>
      </div>

      {/* Alerta de Error de GPS */}
      {errorGps && (
        <div className="banner-gps-error">
          ⚠️ {errorGps}
        </div>
      )}

      {/* Barra de Controles: GPS, Modo Transporte y Buscador */}
      <div className="mapa-controls-bar">
        
        {/* Botones de Control GPS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!siguiendoUbicacion ? (
            <button className="btn-mapa-act" onClick={iniciarWatchPosition}>
              📡 Seguir mi ubicación
            </button>
          ) : (
            <button className="btn-mapa-act activo-gps" onClick={detenerWatchPosition}>
              🛑 Detener GPS en Vivo
            </button>
          )}

          <button className="btn-mapa-sec" onClick={centrarEnMi}>
            🎯 Centrar en mí
          </button>
        </div>

        {/* Buscador Nominatim */}
        <div className="buscador-nominatim-box">
          <input
            type="text"
            placeholder="🔍 Buscar lugar (Ej. Parque Caldas)..."
            value={busquedaText}
            onChange={(e) => setBusquedaText(e.target.value)}
          />
          {buscando && <span className="spinner-mini"></span>}
        </div>

      </div>

      {/* Panel Informativo de Métrica de Ruta y Selector de Modo */}
      {puntoB && (
        <div className="panel-info-ruta-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            
            {/* Selector de Modo */}
            <div className="selector-modo-transporte">
              <button 
                className={modoTransporte === 'driving' ? 'activo' : ''} 
                onClick={() => setModoTransporte('driving')}
              >
                🚗 Vehículo
              </button>
              <button 
                className={modoTransporte === 'walking' ? 'activo' : ''} 
                onClick={() => setModoTransporte('walking')}
              >
                🚶 A Pie
              </button>
            </div>

            {/* Distancia y Tiempo */}
            {infoRuta && (
              <div className="metricas-ruta-box">
                <div>
                  📏 Distancia: <strong style={{ color: infoRuta.esHaversine ? '#f59e0b' : '#38bdf8' }}>{infoRuta.distanciaKm} km</strong>
                  {infoRuta.esHaversine && <small style={{ color: '#f59e0b', marginLeft: '5px' }}>(Línea recta)</small>}
                </div>
                <div>
                  ⏱️ Tiempo est.: <strong style={{ color: '#10b981' }}>~{infoRuta.tiempoMin} min</strong>
                </div>
              </div>
            )}

            {/* Botón de Limpiar */}
            <button className="btn-limpiar-destino" onClick={reiniciarRuta}>
              🗑️ Limpiar Destino
            </button>
          </div>
        </div>
      )}

      {/* Contenedor Principal del Mapa */}
      <div id="mapa-indrive-container" className="mapa-frame"></div>

    </div>
  );
};

export default MapaRuta;