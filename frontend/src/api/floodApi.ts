/**
 * API client for flood prediction endpoints.
 * Sends bounding box coordinates and receives PNG image.
 */
import { BoundingBox, FloodPredictionResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Predict flood risk for a bounding box.
 * Returns a blob URL for the prediction PNG image.
 */
export async function predictFlood(bbox: BoundingBox): Promise<FloodPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bbox),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Get bounds from response headers
  const bounds: BoundingBox = {
    min_lon: parseFloat(response.headers.get('X-Bounds-MinLon') || String(bbox.min_lon)),
    min_lat: parseFloat(response.headers.get('X-Bounds-MinLat') || String(bbox.min_lat)),
    max_lon: parseFloat(response.headers.get('X-Bounds-MaxLon') || String(bbox.max_lon)),
    max_lat: parseFloat(response.headers.get('X-Bounds-MaxLat') || String(bbox.max_lat)),
  };

  // Get weather data from response headers
  const weatherSource = response.headers.get('X-Weather-Source') || 'Synthetic';
  const maxPrecip = parseFloat(response.headers.get('X-Weather-MaxPrecip') || '0');
  const avgPrecip = parseFloat(response.headers.get('X-Weather-AvgPrecip') || '0');
  const minPrecip = parseFloat(response.headers.get('X-Weather-MinPrecip') || '0');
  
  // Debug: Log received headers
  console.log('Weather headers received:', {
    source: weatherSource,
    maxPrecip,
    avgPrecip,
    minPrecip,
    allHeaders: Array.from(response.headers.entries()),
  });

  // Convert response blob to object URL
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);

  return {
    imageUrl,
    bounds,
    timestamp: new Date().toISOString(),
    weather: {
      maxPrecip,
      avgPrecip,
      minPrecip,
      source: weatherSource,
    },
  };
}

/**
 * Health check endpoint.
 */
export async function healthCheck(): Promise<{ status: string; model_loaded: boolean }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

