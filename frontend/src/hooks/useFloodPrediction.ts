/**
 * Custom hook for flood prediction functionality with bounding boxes.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { predictFlood } from '../api/floodApi';
import { BoundingBox, FloodPredictionResponse } from '../types';

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
  const predictionRef = useRef<FloodPredictionResponse | null>(null);

  const predict = useCallback(async (bbox: BoundingBox) => {
    // Revoke previous prediction URL to free memory
    if (predictionRef.current?.imageUrl) {
      URL.revokeObjectURL(predictionRef.current.imageUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await predictFlood(bbox);
      predictionRef.current = response;
      setPrediction(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict flood risk';
      setError(errorMessage);
      predictionRef.current = null;
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (predictionRef.current?.imageUrl) {
      URL.revokeObjectURL(predictionRef.current.imageUrl);
    }
    predictionRef.current = null;
    setPrediction(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (predictionRef.current?.imageUrl) {
        URL.revokeObjectURL(predictionRef.current.imageUrl);
      }
    };
  }, []);

  return {
    prediction,
    isLoading,
    error,
    predict,
    clear,
  };
}

