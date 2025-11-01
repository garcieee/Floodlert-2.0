/**
 * Legend component for flood risk levels.
 * Matches the template design with clean, modern styling.
 */

interface LegendItem {
  label: string;
  color: string;
  description: string;
}

const legendItems: LegendItem[] = [
  { label: 'Low Risk', color: '#10b981', description: 'Minimal flooding expected' },
  { label: 'Medium Risk', color: '#f59e0b', description: 'Moderate flooding possible' },
  { label: 'High Risk', color: '#ef4444', description: 'Significant flooding likely' },
  { label: 'Critical Risk', color: '#92400e', description: 'Severe flooding expected' },
];

function Legend() {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-5 max-w-xs border border-gray-200/50">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Flood Risk Levels</h3>
      <div className="space-y-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{item.label}</div>
              <div className="text-xs text-gray-600 leading-relaxed">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-300/50">
        <p className="text-xs text-gray-600 leading-relaxed">
          Pan and zoom the map to generate real-time flood predictions for the visible area.
        </p>
      </div>
    </div>
  );
}

export default Legend;

