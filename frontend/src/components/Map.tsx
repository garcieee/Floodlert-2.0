/**
 * Map component for displaying flood predictions as raster layers.
 * Sends bounding box to backend when map is panned/moved.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BoundingBox } from '../api/floodApi';

interface MapProps {
  onBoundingBoxChange?: (bbox: BoundingBox) => void;
  predictionImageUrl?: string | null;
  predictionBounds?: BoundingBox | null;
}

const Map: React.FC<MapProps> = ({ 
  onBoundingBoxChange, 
  predictionImageUrl, 
  predictionBounds 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const predictionSourceId = 'flood-prediction';
  const predictionLayerId = 'flood-prediction-layer';
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('VITE_MAPBOX_TOKEN is not set in environment variables');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [0, 20], // Default center (can be adjusted)
      zoom: 2,
    });

    map.current.on('load', () => {
      setIsInitialized(true);
      // Trigger initial bounding box
      updateBoundingBox();
    });

    // Listen for map movements to update bounding box
    map.current.on('moveend', updateBoundingBox);
    map.current.on('zoomend', updateBoundingBox);

    return () => {
      map.current?.remove();
    };
  }, []);

  // Function to get current bounding box and notify parent
  const updateBoundingBox = useCallback(() => {
    if (!map.current) return;

    const bounds = map.current.getBounds();
    const bbox: BoundingBox = {
      min_lon: bounds.getWest(),
      min_lat: bounds.getSouth(),
      max_lon: bounds.getEast(),
      max_lat: bounds.getNorth(),
    };

    if (onBoundingBoxChange) {
      onBoundingBoxChange(bbox);
    }
  }, [onBoundingBoxChange]);

  // Update prediction raster layer when new image is available
  useEffect(() => {
    if (!map.current || !isInitialized || !predictionImageUrl || !predictionBounds) {
      return;
    }

    // Remove existing source/layer if they exist
    if (map.current.getLayer(predictionLayerId)) {
      map.current.removeLayer(predictionLayerId);
    }
    if (map.current.getSource(predictionSourceId)) {
      map.current.removeSource(predictionSourceId);
    }

    // Add image source
    map.current.addSource(predictionSourceId, {
      type: 'image',
      url: predictionImageUrl,
      coordinates: [
        [predictionBounds.min_lon, predictionBounds.max_lat], // top-left
        [predictionBounds.max_lon, predictionBounds.max_lat], // top-right
        [predictionBounds.max_lon, predictionBounds.min_lat], // bottom-right
        [predictionBounds.min_lon, predictionBounds.min_lat], // bottom-left
      ],
    });

    // Add raster layer
    map.current.addLayer({
      id: predictionLayerId,
      type: 'raster',
      source: predictionSourceId,
      paint: {
        'raster-opacity': 0.6, // Make it semi-transparent so map is visible underneath
      },
    });

    // Cleanup function to remove layer when component unmounts or prediction changes
    return () => {
      if (map.current) {
        if (map.current.getLayer(predictionLayerId)) {
          map.current.removeLayer(predictionLayerId);
        }
        if (map.current.getSource(predictionSourceId)) {
          map.current.removeSource(predictionSourceId);
        }
      }
    };
  }, [predictionImageUrl, predictionBounds, isInitialized]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export default Map;
