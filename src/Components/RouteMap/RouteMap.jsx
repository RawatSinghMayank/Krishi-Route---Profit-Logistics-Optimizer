import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ origin, mandis, bestMandi }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedMandi, setSelectedMandi] = useState(bestMandi?.id || null);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [origin.lat, origin.lng],
        zoom: 9,
        zoomControl: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !mandis || mandis.length === 0) return;

    const map = mapInstanceRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom icons
    const originIcon = L.divIcon({
      className: 'custom-marker origin-marker',
      html: '<div class="marker-pin origin"><span class="marker-icon">🏠</span></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const bestMandiIcon = L.divIcon({
      className: 'custom-marker best-marker',
      html: '<div class="marker-pin best"><span class="marker-icon">⭐</span></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const mandiIcon = L.divIcon({
      className: 'custom-marker mandi-marker',
      html: '<div class="marker-pin mandi"><span class="marker-icon">🏪</span></div>',
      iconSize: [35, 35],
      iconAnchor: [17.5, 35],
      popupAnchor: [0, -35],
    });

    // Add origin marker
    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`
        <div class="map-popup">
          <strong>Your Location</strong><br/>
          ${origin.name || 'Current Position'}
        </div>
      `);

    // Add mandi markers and routes
    const bounds = L.latLngBounds([[origin.lat, origin.lng]]);
    
    mandis.forEach((mandi, index) => {
      const isBest = mandi.id === bestMandi?.id;
      const isSelected = mandi.id === selectedMandi;
      
      // Add marker
      const marker = L.marker(
        [mandi.location.lat, mandi.location.lng],
        { icon: isBest ? bestMandiIcon : mandiIcon }
      ).addTo(map);

      // Popup content
      const popupContent = `
        <div class="map-popup ${isBest ? 'best-popup' : ''}">
          ${isBest ? '<div class="popup-badge">⭐ Best Choice</div>' : ''}
          <strong>${mandi.name}</strong><br/>
          <span class="popup-detail">📍 ${mandi.distance.toFixed(1)} km away</span><br/>
          <span class="popup-detail">💰 ₹${mandi.netProfit.toLocaleString('en-IN')} profit</span><br/>
          <span class="popup-detail">📊 ₹${mandi.marketPrice}/quintal</span>
          ${mandi.historicalInsight ? `<br/><span class="popup-insight">💡 ${mandi.historicalInsight}</span>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);

      // Add route line
      const routeLine = L.polyline(
        [[origin.lat, origin.lng], [mandi.location.lat, mandi.location.lng]],
        {
          color: isBest ? '#10b981' : isSelected ? '#3b82f6' : '#94a3b8',
          weight: isBest ? 4 : isSelected ? 3 : 2,
          opacity: isBest ? 0.9 : isSelected ? 0.7 : 0.4,
          dashArray: isBest ? null : '5, 10',
        }
      ).addTo(map);

      // Add distance label on route
      const midPoint = [
        (origin.lat + mandi.location.lat) / 2,
        (origin.lng + mandi.location.lng) / 2,
      ];
      
      const distanceLabel = L.divIcon({
        className: 'distance-label',
        html: `<div class="label-content ${isBest ? 'best-label' : ''}">${mandi.distance.toFixed(0)} km</div>`,
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });
      
      L.marker(midPoint, { icon: distanceLabel }).addTo(map);

      // Add to bounds
      bounds.extend([mandi.location.lat, mandi.location.lng]);

      // Click handler for marker
      marker.on('click', () => {
        setSelectedMandi(mandi.id);
      });
    });

    // Fit map to show all markers
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [origin, mandis, bestMandi, selectedMandi]);

  const handleMandiSelect = (mandiId) => {
    setSelectedMandi(mandiId);
    
    // Find and open popup for selected mandi
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.getLatLng()) {
          const mandi = mandis.find(m => 
            m.location.lat === layer.getLatLng().lat && 
            m.location.lng === layer.getLatLng().lng
          );
          if (mandi && mandi.id === mandiId) {
            layer.openPopup();
          }
        }
      });
    }
  };

  return (
    <div className="route-map-container">
      {/* Map Controls */}
      <div className="map-controls">
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-marker origin-legend">🏠</span>
            <span className="legend-text">Your Location</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker best-legend">⭐</span>
            <span className="legend-text">Best Market</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker mandi-legend">🏪</span>
            <span className="legend-text">Other Markets</span>
          </div>
        </div>

        {/* Quick Market Selector */}
        <div className="market-selector">
          <label className="selector-label">Quick Jump:</label>
          <select 
            className="selector-dropdown"
            value={selectedMandi || ''}
            onChange={(e) => handleMandiSelect(e.target.value)}
          >
            {mandis.map((mandi, index) => (
              <option key={mandi.id || index} value={mandi.id}>
                {mandi.name} ({mandi.distance.toFixed(0)} km - ₹{mandi.netProfit.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="map-element"></div>

      {/* Map Info Panel */}
      <div className="map-info-panel">
        <div className="info-item">
          <span className="info-icon">🗺️</span>
          <div className="info-content">
            <span className="info-label">Total Distance</span>
            <span className="info-value">
              {mandis.reduce((sum, m) => sum + m.distance, 0).toFixed(0)} km covered
            </span>
          </div>
        </div>
        
        <div className="info-item">
          <span className="info-icon">🎯</span>
          <div className="info-content">
            <span className="info-label">Best Route</span>
            <span className="info-value">
              {bestMandi?.name} ({bestMandi?.distance.toFixed(0)} km)
            </span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-icon">⏱️</span>
          <div className="info-content">
            <span className="info-label">Est. Travel Time</span>
            <span className="info-value">
              {Math.ceil((bestMandi?.distance || 0) / 40)} hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
