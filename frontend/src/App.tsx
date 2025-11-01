import React, { useState, useCallback } from 'react';
import Map from './components/Map';
import Legend from './components/Legend';
import { useFloodPrediction } from './hooks/useFloodPrediction';
import { BoundingBox } from './api/floodApi';

function App() {
  const { prediction, isLoading, error, predict, clear } = useFloodPrediction();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle bounding box changes with debouncing
  const handleBoundingBoxChange = useCallback((bbox: BoundingBox) => {
    // Debounce: wait 500ms after last map movement before fetching
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      predict(bbox);
    }, 500);

    setDebounceTimer(timer);
  }, [predict, debounceTimer]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">FloodLert AI</h1>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">Loading prediction...</span>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Map */}
        <Map
          onBoundingBoxChange={handleBoundingBoxChange}
          predictionImageUrl={prediction?.imageUrl || null}
          predictionBounds={prediction?.bounds || null}
        />

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
          <Legend />
          {prediction && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-800">Prediction Info</h3>
              <p className="text-xs text-gray-600">
                Generated: {new Date(prediction.timestamp).toLocaleTimeString()}
              </p>
              <button
                onClick={clear}
                className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Clear Prediction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
