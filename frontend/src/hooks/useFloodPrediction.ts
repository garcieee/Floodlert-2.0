/**
 * Custom hook for flood prediction functionality with bounding boxes.
 */
import { useState, useCallback } from 'react';
import { predictFlood, BoundingBox, FloodPredictionResponse } from '../api/floodApi';

interface UseFloodPredictionReturn {
  prediction: FloodPredictionResponse | null;
  isLoading: boolean;
  error: string | null;
  predict: (bbox: BoundingBox) => Promise<void>;
  clear: () => void;
}

export function useFloodPrediction(): UseFloodPredictionReturn {
  const [prediction, setPrediction] = useState<FloodPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (bbox: BoundingBox) => {
    // Revoke previous prediction URL to free memory
    if (prediction?.imageUrl) {
      URL.revokeObjectURL(prediction.imageUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await predictFlood(bbox);
      setPrediction(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict flood risk';
      setError(errorMessage);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, [prediction]);

  const clear = useCallback(() => {
    if (prediction?.imageUrl) {
      URL.revokeObjectURL(prediction.imageUrl);
    }
    setPrediction(null);
    setError(null);
  }, [prediction]);

  return {
    prediction,
    isLoading,
    error,
    predict,
    clear,
  };
}
