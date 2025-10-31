'use client';
import React, { useEffect, useRef } from 'react';

const Map = React.memo(({ lat, lng, zoom = 12 }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;

    // For now, we'll create a simple map placeholder
    // In a real implementation, you'd integrate with Google Maps, Mapbox, or similar
    const mapContainer = mapRef.current;

    // Create a simple map representation
    mapContainer.textContent = `
      <div style="
        width: 100%;
        height: 300px;
        background: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
                    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
                    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          background: #3b82f6;
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        ">
          📍 Your Location
        </div>
        <div style="
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        ">
          ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
      </div>
    `;
  }, [lat, lng, zoom]);

  return (
    <div className="w-full">
      <div ref={mapRef} className="w-full"></div>
    </div>
  );
});

Map.displayName = 'Map';

export default Map;
