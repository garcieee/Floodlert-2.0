// src/components/MapComponent.jsx
import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Circle, Popup, LayerGroup, Marker } from 'react-leaflet'
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Slider,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Collapse
} from '@mui/material'
import { format } from 'date-fns'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const WORLD_CENTER = [20, 0]
const DEFAULT_ZOOM = 2

const regions = ['All', 'Asia', 'North America', 'South America', 'Europe', 'Africa', 'Oceania']
const severityLevels = ['All', 'high', 'medium', 'low']

// Enhanced mock data with regions and timestamps
const mockAlerts = [
  {
    id: 1,
    location: 'Manila, Philippines',
    coordinates: [14.5995, 120.9842],
    severity: 'high',
    region: 'Asia',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    description: 'Heavy rainfall causing flood risks',
    waterLevel: '2.5m',
    rainfall: '150mm'
  },
  {
    id: 2,
    location: 'Mumbai, India',
    coordinates: [19.0760, 72.8777],
    severity: 'medium',
    region: 'Asia',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    description: 'Monsoon flooding',
    waterLevel: '1.8m',
    rainfall: '120mm'
  },
  {
    id: 3,
    location: 'New Orleans, USA',
    coordinates: [29.9511, -90.0715],
    severity: 'high',
    region: 'North America',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'Hurricane-related flooding',
    waterLevel: '3.0m',
    rainfall: '200mm'
  },
  {
    id: 4,
    location: 'Amsterdam, Netherlands',
    coordinates: [52.3676, 4.9041],
    severity: 'medium',
    region: 'Europe',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    description: 'Coastal flooding alert',
    waterLevel: '1.5m',
    rainfall: '80mm'
  },
  {
    id: 5,
    location: 'São Paulo, Brazil',
    coordinates: [-23.5505, -46.6333],
    severity: 'low',
    region: 'South America',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    description: 'Urban flooding',
    waterLevel: '1.2m',
    rainfall: '90mm'
  }
]

function MapComponent() {
  const [displayType, setDisplayType] = useState('circles')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedSeverity, setSelectedSeverity] = useState('All')
  const [timeRange, setTimeRange] = useState(7) // days
  const [isControlsOpen, setIsControlsOpen] = useState(true)

  const getSeverityStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return { color: 'red', fillColor: '#ff0000', fillOpacity: 0.5, radius: 150000 }
      case 'medium':
        return { color: 'orange', fillColor: '#ffa500', fillOpacity: 0.5, radius: 120000 }
      case 'low':
        return { color: 'yellow', fillColor: '#ffff00', fillOpacity: 0.5, radius: 100000 }
      default:
        return { color: 'blue', fillColor: '#0000ff', fillOpacity: 0.5, radius: 100000 }
    }
  }

  const filteredAlerts = useMemo(() => {
    const now = new Date()
    const timeFilter = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000)
    
    return mockAlerts.filter(alert => {
      const regionMatch = selectedRegion === 'All' || alert.region === selectedRegion
      const severityMatch = selectedSeverity === 'All' || alert.severity === selectedSeverity
      const timeMatch = alert.timestamp >= timeFilter
      return regionMatch && severityMatch && timeMatch
    })
  }, [selectedRegion, selectedSeverity, timeRange])

  const renderAlert = (alert) => {
    const popupContent = (
      <div>
        <Typography variant="h6" sx={{ mb: 1 }}>{alert.location}</Typography>
        <Divider />
        <Box sx={{ mt: 1 }}>
          <Typography><strong>Region:</strong> {alert.region}</Typography>
          <Typography><strong>Severity:</strong> {alert.severity}</Typography>
          <Typography><strong>Water Level:</strong> {alert.waterLevel}</Typography>
          <Typography><strong>Rainfall:</strong> {alert.rainfall}</Typography>
          <Typography><strong>Time:</strong> {format(alert.timestamp, 'PPp')}</Typography>
          <Typography sx={{ mt: 1 }}>{alert.description}</Typography>
        </Box>
      </div>
    )

    if (displayType === 'markers') {
      return (
        <Marker key={alert.id} position={alert.coordinates}>
          <Popup>{popupContent}</Popup>
        </Marker>
      )
    } else {
      return (
        <Circle
          key={alert.id}
          center={alert.coordinates}
          pathOptions={getSeverityStyle(alert.severity)}
        >
          <Popup>{popupContent}</Popup>
        </Circle>
      )
    }
  }

  return (
    <Box sx={{ height: '100%', position: 'relative', display: 'flex' }}>
      {/* Main map and controls container */}
      <Box sx={{ flexGrow: 1, height: '100%', position: 'relative' }}>
        {/* Collapsible Controls Panel */}
        <Paper sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 50,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          maxWidth: 300,
          ml: 3,
          overflow: 'hidden' // Ensure clean collapse animation
        }}>
          {/* Header with collapse button */}
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: isControlsOpen ? 1 : 0,
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon />
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                Flood Alert Controls
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              size="small"
            >
              {isControlsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {/* Collapsible content */}
          <Collapse in={isControlsOpen}>
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <FormControl size="small">
                  <InputLabel>Display Type</InputLabel>
                  <Select
                    value={displayType}
                    label="Display Type"
                    onChange={(e) => setDisplayType(e.target.value)}
                  >
                    <MenuItem value="markers">Markers</MenuItem>
                    <MenuItem value="circles">Circles</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={selectedRegion}
                    label="Region"
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    {regions.map(region => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={selectedSeverity}
                    label="Severity"
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                  >
                    {severityLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Typography gutterBottom>Time Range (Days)</Typography>
                  <Slider
                    value={timeRange}
                    onChange={(e, value) => setTimeRange(value)}
                    valueLabelDisplay="auto"
                    min={1}
                    max={7}
                    marks
                    valueLabelFormat={(value) => `${value}d`}
                  />
                </Box>

                {/* Legend */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Legend</Typography>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ff0000', borderRadius: '50%', mr: 1 }} />
                      <Typography variant="body2">High Severity</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffa500', borderRadius: '50%', mr: 1 }} />
                      <Typography variant="body2">Medium Severity</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffff00', borderRadius: '50%', mr: 1 }} />
                      <Typography variant="body2">Low Severity</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* Map with custom zoom control position */}
        <MapContainer
          center={WORLD_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          minZoom={2}
          maxBounds={[[-90, -180], [90, 180]]}
          zoomControl={false} // Disable default zoom control
        >
          {/* Add zoom control in custom position */}
          <div className="leaflet-control-container">
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control-zoom leaflet-bar leaflet-control">
                <a className="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
                <a className="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a>
              </div>
            </div>
          </div>

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            noWrap={true}
          />
          
          <LayerGroup>
            {filteredAlerts.map(alert => renderAlert(alert))}
          </LayerGroup>
        </MapContainer>
      </Box>

      {/* Alert Panel */}
      <Paper sx={{ 
        width: 350, 
        height: '100%', 
        overflowY: 'auto',
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}>
        <Typography variant="h6" gutterBottom>
          Flood Alerts
        </Typography>
        
        <List>
          {filteredAlerts.length === 0 ? (
            <ListItem>
              <ListItemText primary="No alerts match the current filters" />
            </ListItem>
          ) : (
            filteredAlerts.map((alert) => (
              <ListItem key={alert.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {alert.location}
                      <Chip 
                        size="small" 
                        label={alert.severity.toUpperCase()}
                        color={
                          alert.severity === 'high' ? 'error' : 
                          alert.severity === 'medium' ? 'warning' : 
                          'success'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Region: {alert.region}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Water Level: {alert.waterLevel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rainfall: {alert.rainfall}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Time: {format(alert.timestamp, 'PPp')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {alert.description}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  )
}

// Add some custom CSS to ensure proper zoom control styling
const styles = `
  .leaflet-control-zoom {
    margin-left: 10px !important;
    margin-top: 10px !important;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default MapComponent