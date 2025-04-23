// src/services/api.js
import axios from 'axios'
import { CONFIG } from './config'

const BASE_URL = 'YOUR_API_ENDPOINT'

// Create axios instances for different APIs
const openWeatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: CONFIG.OPENWEATHER_API_KEY,
    units: 'metric'
  }
})

// Mock flood data (until we have a real API)
const mockFloodAlerts = [
  {
    id: 1,
    location: 'Manila',
    coordinates: [14.5995, 120.9842],
    severity: 'high',
    description: 'Heavy rainfall causing flood risks',
    timestamp: new Date().toISOString(),
    waterLevel: '2.5m',
    rainfall: '150mm'
  },
  // Add more mock data for different regions
]

export const ApiService = {
  // Weather data
  async getWeatherData(lat, lng) {
    try {
      const response = await openWeatherApi.get('/weather', {
        params: {
          lat,
          lon: lng
        }
      })
      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        rainfall: response.data.rain ? response.data.rain['1h'] : 0,
        windSpeed: response.data.wind.speed
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return null
    }
  },

  // Flood alerts (currently mock data)
  async getFloodAlerts() {
    // This can be replaced with real API call when available
    return mockFloodAlerts
  },

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