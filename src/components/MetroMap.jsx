import { useEffect, useRef } from 'react';
import { METRO_LINES, METRO_STATIONS, getCanonicalStationName } from '../data/metroStations';

export function MetroMap({
  userLocation,
  activeRoute,
  currentStationIndex,
  onSelectStation
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const linePolylinesRef = useRef([]);
  const stationMarkersRef = useRef(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || typeof window === 'undefined') return;

    const L = window.L;
    if (!L) {
      console.warn('Leaflet (L) not loaded yet');
      return;
    }

    // Default center: Ameerpet Metro Hub
    const map = L.map(mapContainerRef.current, {
      center: [17.4357, 78.4446],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Dark-themed CartoDB tiles for premium dark UI
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Draw Hyderabad Metro Network Lines
    const redStations = METRO_STATIONS.filter((s) => s.line === 'RED').sort((a, b) => a.order - b.order);
    const blueStations = METRO_STATIONS.filter((s) => s.line === 'BLUE').sort((a, b) => a.order - b.order);
    const greenStations = METRO_STATIONS.filter((s) => s.line === 'GREEN').sort((a, b) => a.order - b.order);

    const drawLine = (stations, color, weight = 4) => {
      const latlngs = stations.map((s) => [s.lat, s.lng]);
      const poly = L.polyline(latlngs, {
        color,
        weight,
        opacity: 0.75,
        smoothFactor: 1
      }).addTo(map);
      linePolylinesRef.current.push(poly);
    };

    // Draw background metro line tracks
    drawLine(redStations, METRO_LINES.RED.color);
    drawLine(blueStations, METRO_LINES.BLUE.color);
    drawLine(greenStations, METRO_LINES.GREEN.color);

    // Draw Stations Markers
    METRO_STATIONS.forEach((station) => {
      const lineColor = METRO_LINES[station.line]?.color || '#888';
      const isInterchange = station.isInterchange;

      // Custom HTML Marker for smooth glowing dots
      const markerHtml = `
        <div class="station-map-pin ${isInterchange ? 'pin-interchange' : ''}" style="--pin-color: ${lineColor}">
          <div class="pin-inner"></div>
          ${isInterchange ? '<div class="pin-pulse"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-station-icon',
        html: markerHtml,
        iconSize: isInterchange ? [24, 24] : [16, 16],
        iconAnchor: isInterchange ? [12, 12] : [8, 8]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(map);

      // Tooltip & Popup
      const canonical = getCanonicalStationName(station);
      marker.bindTooltip(`<b>${canonical}</b><br/><span style="color:${lineColor}">${station.line} LINE</span>`, {
        direction: 'top',
        offset: [0, -10],
        className: 'station-tooltip'
      });

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(station);
      });

      stationMarkersRef.current.set(station.id, marker);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onSelectStation]);

  // Update Active Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.stations && activeRoute.stations.length > 1) {
      const routePoints = activeRoute.stations.map((s) => [s.lat, s.lng]);

      // Glowing bright cyan polyline for active journey route
      routePolylineRef.current = L.polyline(routePoints, {
        color: '#06B6D4',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Fit map to show full active route
      map.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [40, 40],
        maxZoom: 14
      });
    }
  }, [activeRoute]);

  // Update User Live Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !userLocation) return;

    const userHtml = `
      <div class="user-live-radar-marker">
        <div class="radar-dot"></div>
        <div class="radar-ring"></div>
        <div class="radar-speed-tag">${Math.round(userLocation.speed || 0)} km/h</div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: userHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      userMarkerRef.current.setIcon(userIcon);
    }
  }, [userLocation]);

  const recenterToUser = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1.2
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '220px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '220px' }} />

      {/* Recenter & Map Controls Overlay */}
      <div className="map-overlay-controls">
        {userLocation && (
          <button
            onClick={recenterToUser}
            className="map-recenter-btn"
            title="Recenter to my location"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>My Spot</span>
          </button>
        )}
      </div>

      {/* Line Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot red"></span>
          <span className="legend-text">Red</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot blue"></span>
          <span className="legend-text">Blue</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot green"></span>
          <span className="legend-text">Green</span>
        </div>
      </div>
    </div>
  );
}
