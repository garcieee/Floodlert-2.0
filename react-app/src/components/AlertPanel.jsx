import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Box,
  Divider 
} from '@mui/material'
import { format } from 'date-fns'

function AlertPanel({ alerts, weatherData, selectedRegion }) {
  return (
    <Paper sx={{ width: 350, p: 2, overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Flood Alerts
        {selectedRegion && ` - ${selectedRegion}`}
      </Typography>
      
      {weatherData && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Current Weather</Typography>
          <Typography>Temperature: {weatherData.temperature}°C</Typography>
          <Typography>Rainfall: {weatherData.rainfall}mm</Typography>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <List>
        {alerts.map((alert) => (
          <ListItem key={alert.id} divider>
            <ListItemText
              primary={alert.location}
              secondary={
                <>
                  <Chip 
                    size="small" 
                    label={alert.severity}
                    color={alert.severity === 'high' ? 'error' : 'warning'}
                    sx={{ mr: 1 }}
                  />
                  {format(new Date(alert.timestamp), 'PPp')}
                  <Typography variant="body2">
                    {alert.description}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default AlertPanel
