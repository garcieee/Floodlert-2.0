import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Stack
} from '@mui/material'
import { 
  LocationOn, 
  Circle as CircleIcon,
  Grain,
  Timeline
} from '@mui/icons-material'

function MapControls({ 
  selectedRegion,
  setSelectedRegion,
  selectedSeverity,
  setSeverity,
  visualizationType,
  setVisualizationType,
  timeRange,
  setTimeRange,
  regions,
  severityLevels 
}) {
  return (
    <Paper sx={{ p: 2, m: 2, position: 'absolute', top: 0, right: 0, zIndex: 1000, maxWidth: 300 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Map Controls</Typography>
        
        {/* Visualization Type */}
        <FormControl size="small">
          <InputLabel>Display Type</InputLabel>
          <ToggleButtonGroup
            value={visualizationType}
            exclusive
            onChange={(e, value) => setVisualizationType(value)}
            size="small"
            fullWidth
          >
            <ToggleButton value="markers">
              <LocationOn />
            </ToggleButton>
            <ToggleButton value="circles">
              <CircleIcon />
            </ToggleButton>
            <ToggleButton value="heatmap">
              <Grain />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        {/* Region Filter */}
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

        {/* Severity Filter */}
        <FormControl size="small">
          <InputLabel>Severity</InputLabel>
          <Select
            value={selectedSeverity}
            label="Severity"
            onChange={(e) => setSeverity(e.target.value)}
          >
            {severityLevels.map(level => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Time Range */}
        <Box>
          <Typography variant="subtitle2">Time Range</Typography>
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
    </Paper>
  )
}

export default MapControls
