import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map from './components/Map';
import Legend from './components/Legend';
import { useFloodPrediction } from './hooks/useFloodPrediction';
import { BoundingBox } from './types';
import { healthCheck } from './api/floodApi';

function App() {
  const { prediction, isLoading, error, predict, clear } = useFloodPrediction();
  const debounceTimerRef = useRef<number | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; model_loaded: boolean } | null>(null);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await healthCheck();
        setApiHealth(health);
      } catch (err) {
        console.error('Health check failed:', err);
        setApiHealth({ status: 'unhealthy', model_loaded: false });
      }
    };
    checkHealth();
  }, []);

  // Handle bounding box changes with debouncing
  const handleBoundingBoxChange = useCallback((bbox: BoundingBox) => {
    // Debounce: wait 500ms after last map movement before fetching
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      predict(bbox);
    }, 500);
  }, [predict]);

  return (
    <div className="w-screen h-screen flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md text-gray-900 px-6 py-4 flex items-center justify-between shadow-md z-10 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">FloodLert AI</h1>
          <span className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
            Real-time Flood Prediction
          </span>
        </div>
        <div className="flex items-center gap-4">
          {apiHealth && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${apiHealth.model_loaded ? 'bg-green-500' : 'bg-yellow-500'} shadow-sm`} />
              <span className="text-gray-700 font-medium">{apiHealth.model_loaded ? 'Model Ready' : 'Model Loading...'}</span>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm text-gray-700 font-medium">Generating prediction...</span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm max-w-xs truncate font-medium bg-red-50 px-3 py-1.5 rounded-full" title={error}>
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative min-h-0">
        {/* Map */}
        <Map
          onBoundingBoxChange={handleBoundingBoxChange}
          predictionImageUrl={prediction?.imageUrl || null}
          predictionBounds={prediction?.bounds || null}
        />

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <Legend />
          {prediction && (
            <>
              {/* Weather Info */}
              {prediction.weather && (
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-5 max-w-xs border border-gray-200/50">
                  <h3 className="text-sm font-bold mb-3 text-gray-900">Weather Data</h3>
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Source:</span>
                      <span className="text-xs font-semibold text-blue-600">{prediction.weather.source}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Max Precipitation:</span>
                        <span className="text-xs font-medium text-gray-900">{prediction.weather.maxPrecip.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Average:</span>
                        <span className="text-xs font-medium text-gray-900">{prediction.weather.avgPrecip.toFixed(1)} mm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Min:</span>
                        <span className="text-xs font-medium text-gray-900">{prediction.weather.minPrecip.toFixed(1)} mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Prediction Info */}
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-5 max-w-xs border border-gray-200/50">
                <h3 className="text-sm font-bold mb-3 text-gray-900">Prediction Info</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-600">
                    Generated: <span className="font-medium text-gray-900">{new Date(prediction.timestamp).toLocaleTimeString()}</span>
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Bounds: {prediction.bounds.min_lat.toFixed(2)}, {prediction.bounds.min_lon.toFixed(2)}</div>
                    <div>to {prediction.bounds.max_lat.toFixed(2)}, {prediction.bounds.max_lon.toFixed(2)}</div>
                  </div>
                </div>
                <button
                  onClick={clear}
                  className="w-full text-xs bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
                >
                  Clear Prediction
                </button>
              </div>
            </>
          )}
        </div>

        {/* Instructions Overlay */}
        {!prediction && !isLoading && (
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-5 max-w-md border border-gray-200/50">
            <h3 className="text-sm font-bold mb-3 text-gray-900">How to Use</h3>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Pan and zoom the map to explore different regions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>The system automatically generates flood predictions for the visible area</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Predictions update automatically when you move the map</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Red areas indicate higher flood risk, blue areas indicate lower risk</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

