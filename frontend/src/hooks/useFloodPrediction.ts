/**
 * Custom hook for flood prediction functionality.
 */
import { useState } from 'react';
import { predictFlood, FloodPredictionRequest, FloodPredictionResponse } from '../api/floodApi';

interface UseFloodPredictionReturn {
  prediction: FloodPredictionResponse | null;
  isLoading: boolean;
  error: string | null;
  predict: (lat: number, lng: number, elevation?: number) => Promise<void>;
  clear: () => void;
}

export function useFloodPrediction(): UseFloodPredictionReturn {
  const [prediction, setPrediction] = useState<FloodPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (lat: number, lng: number, elevation?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: FloodPredictionRequest = {
        latitude: lat,
        longitude: lng,
        ...(elevation !== undefined && { elevation }),
      };

      const response = await predictFlood(request);
      setPrediction(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict flood risk';
      setError(errorMessage);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setPrediction(null);
    setError(null);
  };

  return {
    prediction,
    isLoading,
    error,
    predict,
    clear,
  };
}

