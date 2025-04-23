// src/components/Layout.jsx
import { useState } from 'react'
import { Box, Container } from '@mui/material'
import Header from './Header'
import MapComponent from './MapComponent'
import AlertPanel from './AlertPanel'

function Layout() {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [weatherData, setWeatherData] = useState(null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', gap: 2, py: 2 }}>
        <Box sx={{ flexGrow: 1, height: 'calc(100vh - 100px)' }}>
          <MapComponent 
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            alerts={alerts}
          />
        </Box>
        <AlertPanel 
          alerts={alerts}
          weatherData={weatherData}
          selectedRegion={selectedRegion}
        />
      </Container>
    </Box>
  )
}

export default Layout