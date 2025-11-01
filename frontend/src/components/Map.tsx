/**
 * Map component for displaying flood predictions as raster layers.
 * Sends bounding box to backend when map is panned/moved.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BoundingBox } from '../types';

interface MapProps {
  onBoundingBoxChange?: (bbox: BoundingBox) => void;
  predictionImageUrl?: string | null;
  predictionBounds?: BoundingBox | null;
}

type MapStatus = 'loading' | 'ready' | 'error';

// Component for displaying status overlays
const MapOverlay = ({ status, error }: { status: MapStatus, error?: string }) => {
  if (status === 'ready') return null;

  return (
    <div className="absolute inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-10">
      <div className="text-center p-6 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-300 border-t-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-700 font-medium">Loading Map...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="font-bold text-red-600 text-lg">Map Error</p>
            <p className="mt-2 text-gray-600 text-sm max-w-xs">{error || 'Could not load the map.'}</p>
          </>
        )}
      </div>
    </div>
  );
};

function Map({ 
  onBoundingBoxChange, 
  predictionImageUrl, 
  predictionBounds 
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [status, setStatus] = useState<MapStatus>('loading');
  const [error, setError] = useState<string>('');
  
  const onBoundingBoxChangeRef = useRef(onBoundingBoxChange);
  useEffect(() => {
    onBoundingBoxChangeRef.current = onBoundingBoxChange;
  }, [onBoundingBoxChange]);

  const updateBoundingBox = useCallback(() => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    if (!bounds) return;
    const bbox: BoundingBox = {
      min_lon: bounds.getWest(),
      min_lat: bounds.getSouth(),
      max_lon: bounds.getEast(),
      max_lat: bounds.getNorth(),
    };
    onBoundingBoxChangeRef.current?.(bbox);
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize only once

    setStatus('loading');

    // MapLibre doesn't need an API token - uses free OpenStreetMap tiles
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [120, 15], // Default center (Philippines region)
      zoom: 5,
    });
    map.current = mapInstance;

    const handleLoad = () => {
      setStatus('ready');
      updateBoundingBox();
    };

    mapInstance.on('load', handleLoad);
    mapInstance.on('moveend', updateBoundingBox);
    mapInstance.on('zoomend', updateBoundingBox);

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [updateBoundingBox]);

  // Update prediction raster layer
  useEffect(() => {
    const predictionSourceId = 'flood-prediction-source';
    const predictionLayerId = 'flood-prediction-layer';

    if (status !== 'ready' || !map.current || !predictionImageUrl || !predictionBounds) {
      return;
    }

    const currentMap = map.current;

    const addLayer = () => {
      currentMap.addSource(predictionSourceId, {
        type: 'image',
        url: predictionImageUrl,
        coordinates: [
          [predictionBounds.min_lon, predictionBounds.max_lat],
          [predictionBounds.max_lon, predictionBounds.max_lat],
          [predictionBounds.max_lon, predictionBounds.min_lat],
          [predictionBounds.min_lon, predictionBounds.min_lat],
        ],
      });

      currentMap.addLayer({
        id: predictionLayerId,
        type: 'raster',
        source: predictionSourceId,
        paint: { 'raster-opacity': 0.6 },
      });
    };

    if (currentMap.isStyleLoaded()) {
      addLayer();
    } else {
      currentMap.once('styledata', addLayer);
    }

    return () => {
      if (currentMap.isStyleLoaded()) {
        try {
          if (currentMap.getLayer(predictionLayerId)) {
            currentMap.removeLayer(predictionLayerId);
          }
          if (currentMap.getSource(predictionSourceId)) {
            currentMap.removeSource(predictionSourceId);
          }
        } catch (err) {
            console.error("Error cleaning up map layer:", err);
        }
      }
    };
  }, [predictionImageUrl, predictionBounds, status]);

  return (
    <div className="relative w-full h-full">
      <MapOverlay status={status} error={error} />
      <div
        ref={mapContainer}
        className="w-full h-full"
      />
    </div>
  );
}

export default Map;