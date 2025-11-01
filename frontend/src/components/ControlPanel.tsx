/**
 * Control panel component for flood prediction controls.
 */
import React, { useState } from 'react';

interface ControlPanelProps {
  onPredict: (lat: number, lng: number) => void;
  isLoading?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onPredict, isLoading }) => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onPredict(lat, lng);
    } else {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          onPredict(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Flood Prediction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 40.7128"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., -74.0060"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Predicting...' : 'Predict Flood Risk'}
          </button>
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            title="Use current location"
          >
            📍
          </button>
        </div>
      </form>
    </div>
  );
};

export default ControlPanel;

