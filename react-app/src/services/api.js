// src/services/api.js
import axios from 'axios'

const BASE_URL = 'YOUR_API_ENDPOINT'

export const fetchFloodAlerts = async () => {
  try {
    // This is where you'll integrate with your chosen API
    const response = await axios.get(`${BASE_URL}/flood-alerts`)
    return response.data
  } catch (error) {
    console.error('Error fetching flood alerts:', error)
    return []
  }
}

  // Weather forecast
  async getForecast(lat, lng) {
    try {
      const response = await openWeatherApi.get('/forecast', {
        params: {
          lat,
          lon: lng
        }
      })
      return response.data.list.map(item => ({
        timestamp: item.dt * 1000,
        temperature: item.main.temp,
        rainfall: item.rain ? item.rain['3h'] : 0,
        description: item.weather[0].description
      }))
    } catch (error) {
      console.error('Error fetching forecast:', error)
      return []
    }
  }
}