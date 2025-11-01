"""
Schemas for flood prediction API.
"""
from pydantic import BaseModel, Field


class BoundingBoxRequest(BaseModel):
    """Request schema for bounding box-based flood prediction."""
    min_lon: float = Field(..., ge=-180, le=180, description="Minimum longitude (west)")
    min_lat: float = Field(..., ge=-90, le=90, description="Minimum latitude (south)")
    max_lon: float = Field(..., ge=-180, le=180, description="Maximum longitude (east)")
    max_lat: float = Field(..., ge=-90, le=90, description="Maximum latitude (north)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "min_lon": -74.0060,
                "min_lat": 40.7128,
                "max_lon": -73.9350,
                "max_lat": 40.7580
            }
        }

