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
    # Using Open-Meteo (free, no API key required)
    WEATHER_API_PROVIDER: str = "open-meteo"  # Options: "open-meteo", "synthetic"
    
    # Prediction Method Configuration
    PREDICTION_METHOD: str = "anuga"  # Options: "anuga" (physics-based), "unet" (ML-based)
    
    # Image Generation
    PREDICTION_IMAGE_WIDTH: int = 512
    PREDICTION_IMAGE_HEIGHT: int = 512
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

