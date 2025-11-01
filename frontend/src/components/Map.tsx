/**
 * Map component for displaying flood predictions.
 */
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  floodData?: any;
  onLocationClick?: (lat: number, lng: number) => void;
}

const Map: React.FC<MapProps> = ({ floodData, onLocationClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [0, 0],
      zoom: 2,
    });

    // Add click handler
    if (onLocationClick) {
      map.current.on('click', (e) => {
        onLocationClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [onLocationClick]);

  useEffect(() => {
    if (!map.current || !floodData) return;

    // TODO: Add flood data visualization layers
    // This would include overlaying flood predictions on the map
  }, [floodData]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export default Map;

