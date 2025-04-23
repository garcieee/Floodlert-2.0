// src/components/MapComponent.jsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ApiService } from '../services/api'

// Updated to show world center coordinates
const WORLD_CENTER = [20, 0] // This will center the map in the middle of the world
const DEFAULT_ZOOM = 2 // Zoomed out to show the entire world

function MapComponent({ selectedRegion, setSelectedRegion, alerts }) {
  const [loading, setLoading] = useState(true)

  // Mock global flood alerts for demonstration
  const globalAlerts = [
    {
      id: 1,
      location: 'Manila, Philippines',
      coordinates: [14.5995, 120.9842],
      severity: 'high',
      waterLevel: '2.5m',
      rainfall: '150mm',
      description: 'Heavy rainfall causing flood risks'
    },
    {
      id: 2,
      location: 'Mumbai, India',
      coordinates: [19.0760, 72.8777],
      severity: 'medium',
      waterLevel: '1.8m',
      rainfall: '120mm',
      description: 'Monsoon flooding'
    },
    {
      id: 3,
      location: 'New Orleans, USA',
      coordinates: [29.9511, -90.0715],
      severity: 'high',
      waterLevel: '3.0m',
      rainfall: '200mm',
      description: 'Hurricane-related flooding'
    },
    {
      id: 4,
      location: 'Amsterdam, Netherlands',
      coordinates: [52.3676, 4.9041],
      severity: 'medium',
      waterLevel: '1.5m',
      rainfall: '80mm',
      description: 'Coastal flooding alert'
    },
    {
      id: 5,
      location: 'Bangkok, Thailand',
      coordinates: [13.7563, 100.5018],
      severity: 'high',
      waterLevel: '2.8m',
      rainfall: '180mm',
      description: 'River overflow warning'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch global data implementation here
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to determine circle color based on severity
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return { color: 'red', fillColor: '#ff0000' }
      case 'medium':
        return { color: 'orange', fillColor: '#ffa500' }
      case 'low':
        return { color: 'yellow', fillColor: '#ffff00' }
      default:
        return { color: 'blue', fillColor: '#0000ff' }
    }
  }

  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      minZoom={2} // Prevent zooming out too far
      maxBounds={[[-90, -180], [90, 180]]} // Restrict panning to world bounds
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        noWrap={true} // Prevents the map from repeating horizontally
      />
      
      {globalAlerts.map(alert => {
        const severityColors = getSeverityColor(alert.severity)
        return (
          <Circle
            key={alert.id}
            center={alert.coordinates}
            radius={100000} // Increased radius to be visible on world scale
            pathOptions={{
              color: severityColors.color,
              fillColor: severityColors.fillColor,
              fillOpacity: 0.3
            }}
          >
            <Popup>
              <div style={{ padding: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{alert.location}</h3>
                <p style={{ margin: '5px 0' }}>
                  <strong>Severity:</strong> {alert.severity}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Water Level:</strong> {alert.waterLevel}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Rainfall:</strong> {alert.rainfall}
                </p>
                <p style={{ margin: '5px 0' }}>{alert.description}</p>
              </div>
            </Popup>
          </Circle>
        )
      })}
    </MapContainer>
  )
}

export default MapComponent