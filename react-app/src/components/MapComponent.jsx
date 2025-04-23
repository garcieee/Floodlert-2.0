// src/components/MapComponent.jsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ApiService } from '../services/api'
import { CONFIG } from '../services/config'

function MapComponent({ selectedRegion, setSelectedRegion, alerts }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch data implementation here
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <MapContainer
      center={[CONFIG.DEFAULT_COORDINATES.lat, CONFIG.DEFAULT_COORDINATES.lng]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {alerts.map(alert => (
        <Circle
          key={alert.id}
          center={alert.coordinates}
          radius={20000}
          pathOptions={{
            color: alert.severity === 'high' ? 'red' : 'orange',
            fillColor: alert.severity === 'high' ? '#ff0000' : '#ffa500',
            fillOpacity: 0.3
          }}
        >
          <Popup>
            <h3>{alert.location}</h3>
            <p>Severity: {alert.severity}</p>
            <p>Water Level: {alert.waterLevel}</p>
            <p>Rainfall: {alert.rainfall}</p>
            <p>{alert.description}</p>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  )
}

export default MapComponent