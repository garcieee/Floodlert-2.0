/**
 * API client for flood prediction endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface FloodPredictionRequest {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface FloodPredictionResponse {
  flood_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_depth?: number;
  timestamp: string;
}

/**
 * Predict flood risk for a given location.
 */
export async function predictFlood(
  request: FloodPredictionRequest
): Promise<FloodPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check endpoint.
 */
export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}

