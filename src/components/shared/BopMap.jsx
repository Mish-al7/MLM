'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon paths broken by webpack/Next.js bundling
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default center = India (if no coords given)
const INDIA_CENTER = [20.5937, 78.9629];

export default function BopMap({ lat, lng, venue, zoom = 14 }) {
  const hasCoords = lat != null && lng != null;
  const center = hasCoords ? [lat, lng] : INDIA_CENTER;
  const mapZoom = hasCoords ? zoom : 5;

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-[#C5A059]/30 shadow-md">
      <MapContainer
        center={center}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasCoords && (
          <Marker position={[lat, lng]} icon={markerIcon}>
            <Popup>
              <div className="text-sm font-semibold text-slate-800 space-y-1.5">
                <p>{venue || 'BOP Venue'}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#C5A059] hover:underline font-bold"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
