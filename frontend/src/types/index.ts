/**
 * Type definitions for the FloodLert AI application.
 */

export interface BoundingBox {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
}

export interface FloodPredictionResponse {
  imageUrl: string;
  bounds: BoundingBox;
  timestamp: string;
  weather?: {
    maxPrecip: number;
    avgPrecip: number;
    minPrecip: number;
    source: string;
  };
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

