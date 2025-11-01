/**
 * Type definitions for the FloodLert AI application.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface FloodPrediction {
  flood_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_depth?: number;
  timestamp: string;
}

export interface MapLocation {
  lat: number;
  lng: number;
  prediction?: FloodPrediction;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

