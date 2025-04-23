// src/components/MapComponent.jsx
import { useEffect, useState, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Circle, Popup, LayerGroup, Marker, useMap } from 'react-leaflet'
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
  Collapse,
  Slide,
  useTheme,
  useMediaQuery,
  ThemeProvider
} from '@mui/material'
import { format } from 'date-fns'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material'
import { Fab } from '@mui/material'
import { divIcon } from 'leaflet'

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

// Add this new component to handle map movements
function MapController({ center, zoom }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 8, {
        duration: 1.5, // Animation duration in seconds
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])

  return null
}

function MapComponent() {
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedSeverity, setSelectedSeverity] = useState('All')
  const [timeRange, setTimeRange] = useState(7) // days
  const [isControlsOpen, setIsControlsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isAlertPanelOpen, setIsAlertPanelOpen] = useState(true)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const alertPanelWidth = isMobile ? '100%' : isTablet ? '400px' : '350px'

  // Custom marker icon with larger size
  const getCustomMarkerIcon = (severity) => {
    const color = severity === 'high' ? '#ff0000' : 
                 severity === 'medium' ? '#ffa500' : '#ffff00';
    
    const markerHtml = `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>
    `;

    return divIcon({
      html: markerHtml,
      className: 'custom-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  // Updated getSeverityStyle function with larger circles
  const getSeverityStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return { 
          color: 'red', 
          fillColor: '#ff0000', 
          fillOpacity: 0.6, 
          weight: 2,
          radius: 200000 // Increased radius
        }
      case 'medium':
        return { 
          color: 'orange', 
          fillColor: '#ffa500', 
          fillOpacity: 0.6, 
          weight: 2,
          radius: 170000 // Increased radius
        }
      case 'low':
        return { 
          color: 'yellow', 
          fillColor: '#ffff00', 
          fillOpacity: 0.6, 
          weight: 2,
          radius: 150000 // Increased radius
        }
      default:
        return { 
          color: 'blue', 
          fillColor: '#0000ff', 
          fillOpacity: 0.6, 
          weight: 2,
          radius: 150000 
        }
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

  // Updated renderAlert function
  const renderAlert = (alert) => {
    const popupContent = (
      <div style={{ minWidth: '200px', padding: '8px' }}>
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

    return (
      <Marker 
        key={alert.id} 
        position={alert.coordinates}
        icon={getCustomMarkerIcon(alert.severity)}
        eventHandlers={{
          click: () => handleAlertClick(alert.coordinates)
        }}
      >
        <Popup className="custom-popup">
          {popupContent}
        </Popup>
      </Marker>
    )
  }

  // Function to handle alert selection
  const handleAlertClick = (coordinates) => {
    setSelectedLocation(coordinates)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100%', position: 'relative' }}>
        {/* Map container - now takes full width */}
        <Box sx={{ height: '100%', width: '100%' }}>
          {/* Collapsible Controls Panel - Responsive */}
          <Paper sx={{ 
            position: 'absolute', 
            top: 10,
            left: 50,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            width: 'auto',
            maxWidth: 300,
          }}>
            {/* Controls Panel Header */}
            <Box sx={{ 
              p: 1.5,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: isControlsOpen ? 1 : 0,
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                  Marker Filters
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
                </Stack>
              </Box>
            </Collapse>
          </Paper>

          {/* Map - now takes full width */}
          <MapContainer
            center={WORLD_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            zoomControl={!isMobile}
          >
            {isMobile && (
              <Box sx={{ 
                position: 'absolute',
                bottom: isControlsOpen ? '50%' : 70,
                right: 10,
                zIndex: 1000,
                transition: 'bottom 0.3s ease'
              }}>
                {/* Custom zoom controls for mobile */}
                <Stack spacing={1}>
                  <IconButton
                    onClick={() => map.zoomIn()}
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'white' } }}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => map.zoomOut()}
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'white' } }}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Stack>
              </Box>
            )}
            <MapController center={selectedLocation} zoom={8} />
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

        {/* Collapse toggle button - Responsive */}
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              right: isAlertPanelOpen ? alertPanelWidth : 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200,
              transition: 'right 0.3s ease'
            }}
          >
            <IconButton
              onClick={() => setIsAlertPanelOpen(!isAlertPanelOpen)}
              sx={{
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                boxShadow: 2,
                borderRadius: '4px',
                borderTopRightRadius: isAlertPanelOpen ? 0 : '4px',
                borderBottomRightRadius: isAlertPanelOpen ? 0 : '4px',
                borderTopLeftRadius: isAlertPanelOpen ? '4px' : 0,
                borderBottomLeftRadius: isAlertPanelOpen ? '4px' : 0,
              }}
            >
              {isAlertPanelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        )}

        {/* Alert Panel - Responsive */}
        <Slide 
          direction={isMobile ? 'up' : 'left'} 
          in={isAlertPanelOpen} 
          mountOnEnter 
          unmountOnExit
        >
          <Paper sx={{ 
            width: alertPanelWidth,
            height: isMobile ? '70%' : '100%',
            position: 'absolute',
            right: 0,
            [isMobile ? 'bottom' : 'top']: 0,
            overflowY: 'auto',
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 1100,
            boxShadow: 3,
            borderRadius: isMobile ? '12px 12px 0 0' : 0,
          }}>
            {/* Mobile close button */}
            {isMobile && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
                onClick={() => setIsAlertPanelOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            )}

            {/* Alert Panel Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              pb: 1,
              pr: isMobile ? 4 : 0
            }}>
              <NotificationsIcon />
              <Typography variant="h6">
                Flood Alerts
              </Typography>
            </Box>

            {/* Alert List */}
            <List sx={{
              pt: 0,
              '& .MuiListItem-root': {
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 }
              }
            }}>
              {filteredAlerts.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No alerts match the current filters" />
                </ListItem>
              ) : (
                filteredAlerts.map((alert) => (
                  <ListItem 
                    key={alert.id} 
                    divider
                    button 
                    onClick={() => handleAlertClick(alert.coordinates)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      backgroundColor: selectedLocation === alert.coordinates ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    }}
                  >
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
                              'warning'
                            }
                            sx={{
                              ...(alert.severity === 'low' && {
                                backgroundColor: '#ffff00',
                                color: 'rgba(0, 0, 0, 0.87)',
                              })
                            }}
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
        </Slide>

        {/* Mobile Alert Panel Toggle Button */}
        {isMobile && !isAlertPanelOpen && (
          <Fab
            color="primary"
            sx={{
              position: 'absolute',
              right: 16,
              bottom: isControlsOpen ? '50%' : 76,
              transition: 'bottom 0.3s ease',
              zIndex: 1200
            }}
            onClick={() => setIsAlertPanelOpen(true)}
          >
            <NotificationsIcon />
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  )
}

// Add these styles to your CSS
const styles = `
  .custom-marker {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .custom-popup .leaflet-popup-content {
    margin: 8px;
    min-width: 200px;
  }

  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }

  .leaflet-container {
    font: inherit;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default MapComponent