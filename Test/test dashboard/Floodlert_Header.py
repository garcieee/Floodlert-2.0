import time
import requests
from dataclasses import dataclass
from typing import Dict, Optional
from datetime import datetime

@dataclass
class Coordinates:
    lat: float
    lon: float

@dataclass
class WeatherData:
    temperature: float
    time: str

class WeatherAPI:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def fetch_weather(coordinates: Coordinates) -> Optional[WeatherData]:
        """Fetch weather data from Open-Meteo API."""
        try:
            params = {
                "latitude": coordinates.lat,
                "longitude": coordinates.lon,
                "current_weather": "true"
            }
            response = requests.get(WeatherAPI.BASE_URL, params=params)
            response.raise_for_status()
            
            data = response.json().get("current_weather", {})
            return WeatherData(
                temperature=data.get("temperature"),
                time=data.get("time")
            )
        except requests.RequestException as e:
            print(f"\nError fetching weather data: {e}")
            return None

class LocationService:
    """Service to manage city coordinates and location data."""
    
    CITY_COORDINATES = {
        "tokyo": Coordinates(lat=35.6895, lon=139.6917),
        "new york": Coordinates(lat=40.7128, lon=-74.0060),
        "london": Coordinates(lat=51.5074, lon=-0.1278),
    }

    @staticmethod
    def get_coordinates(city: str) -> Optional[Coordinates]:
        """Get coordinates for a given city name."""
        return LocationService.CITY_COORDINATES.get(city.lower())

class DisasterInfoService:
    """Service to handle disaster-related information."""
    
    @staticmethod
    def get_flood_info() -> Dict[str, str]:
        """Fetch flood information (placeholder)."""
        return {
            "level": "High",
            "affected_areas": ["City A", "City B", "City C"],
            "advisory": "Evacuate low-lying areas immediately."
        }

    @staticmethod
    def get_typhoon_info() -> Dict[str, str]:
        """Fetch typhoon information (placeholder)."""
        return {
            "name": "Typhoon Lionrock",
            "wind_speed": "150 km/h",
            "location": "Latitude 15.2N, Longitude 120.7E",
            "advisory": "Stay indoors and secure loose objects."
        }

class DashboardConsole:
    def __init__(self):
        self.running = True
        self.city = "Tokyo"
        self.coordinates = LocationService.get_coordinates(self.city)
        self.weather_api = WeatherAPI()
        self.disaster_service = DisasterInfoService()

    def display_weather_info(self, weather_data: Optional[WeatherData]) -> None:
        """Display current weather information."""
        print("\nWeather Information:")
        print(f"- City: {self.city}")
        
        if weather_data:
            print(f"- Time: {weather_data.time}")
            print(f"- Temperature: {weather_data.temperature}°C")
        else:
            print("- Weather data unavailable")

    def display_flood_info(self) -> None:
        """Display flood information."""
        flood_info = self.disaster_service.get_flood_info()
        print("\nFlood Information:")
        print(f"- Flood Level: {flood_info['level']}")
        print(f"- Affected Areas: {', '.join(flood_info['affected_areas'])}")
        print(f"- Advisory: {flood_info['advisory']}")

    def display_typhoon_info(self) -> None:
        """Display typhoon information."""
        typhoon_info = self.disaster_service.get_typhoon_info()
        print("\nTyphoon Information:")
        print(f"- Typhoon Name: {typhoon_info['name']}")
        print(f"- Wind Speed: {typhoon_info['wind_speed']}")
        print(f"- Current Location: {typhoon_info['location']}")
        print(f"- Advisory: {typhoon_info['advisory']}")

    def update_location(self) -> None:
        """Update the current city and its coordinates."""
        print("\nSettings")
        new_city = input("Enter the new city: ").strip()
        
        new_coordinates = LocationService.get_coordinates(new_city)
        if new_coordinates:
            self.city = new_city.title()
            self.coordinates = new_coordinates
            print(f"City updated to {self.city}.")
        else:
            print("City not found in the database. Using current coordinates.")
        
        self.refresh_weather()

    def refresh_weather(self) -> None:
        """Fetch and display current weather data."""
        if self.coordinates:
            weather_data = WeatherAPI.fetch_weather(self.coordinates)
            self.display_weather_info(weather_data)

    def display_menu(self) -> None:
        """Display the main menu options."""
        print("\nDashboard")
        print("1. Show Flood Information")
        print("2. Show Typhoon Information")
        print("3. Settings")
        print("4. Exit")

    def handle_menu_choice(self, choice: str) -> None:
        """Handle user menu selection."""
        if choice == "1":
            self.display_flood_info()
            self.refresh_weather()
        elif choice == "2":
            self.display_typhoon_info()
            self.refresh_weather()
        elif choice == "3":
            self.update_location()
        elif choice == "4":
            print("Exiting the dashboard. Stay safe!")
            self.running = False
        else:
            print("Invalid choice. Please try again.")

    def run(self) -> None:
        """Main application loop."""
        self.refresh_weather()
        
        while self.running:
            self.display_menu()
            choice = input("Enter your choice: ").strip()
            self.handle_menu_choice(choice)

if __name__ == "__main__":
    dashboard = DashboardConsole()
    dashboard.run()