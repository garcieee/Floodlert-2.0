"""
Configuration settings for the FloodLert AI application.
"""
from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FloodLert AI"
    
    # Model Configuration
    MODEL_PATH: Optional[str] = None  # Will default to data/flood_model.pth
    TERRAIN_DATA_PATH: str = "data/terrain_data.tif"
    
    # Weather API Configuration
    # Example: NOAA GFS data endpoint
    # You'll need to configure this based on your actual weather data source
    WEATHER_API_URL: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None
    
    # Image Generation
    PREDICTION_IMAGE_WIDTH: int = 512
    PREDICTION_IMAGE_HEIGHT: int = 512
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
