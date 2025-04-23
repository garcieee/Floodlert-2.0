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

function AlertPanel({ alerts }) {
  return (
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
        {alerts.length === 0 ? (
          <ListItem>
            <ListItemText primary="No alerts match the current filters" />
          </ListItem>
        ) : (
          alerts.map((alert) => (
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
  )
}

export default AlertPanel
