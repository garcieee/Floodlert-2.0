/**
 * Legend component for flood risk levels.
 */
import React from 'react';

interface LegendItem {
  label: string;
  color: string;
  description?: string;
}

const legendItems: LegendItem[] = [
  { label: 'Low Risk', color: '#10b981', description: 'Minimal flooding expected' },
  { label: 'Medium Risk', color: '#f59e0b', description: 'Moderate flooding possible' },
  { label: 'High Risk', color: '#ef4444', description: 'Significant flooding likely' },
  { label: 'Critical Risk', color: '#7c2d12', description: 'Severe flooding expected' },
];

const Legend: React.FC = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Flood Risk Levels</h3>
      <div className="space-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-600">{item.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;

