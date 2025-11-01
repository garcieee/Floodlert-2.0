"""
Flood prediction API endpoint.
"""
import io
import logging
from datetime import datetime
from typing import Tuple
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import numpy as np
import xarray as xr
import rasterio
from rasterio.warp import reproject, Resampling, calculate_default_transform
from rasterio.crs import CRS
import httpx
from PIL import Image
import tempfile
import os

from app.schemas.prediction import BoundingBoxRequest
import app.services.flood_model
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def fetch_weather_data(
    min_lon: float,
    min_lat: float,
    max_lon: float,
    max_lat: float
) -> Tuple[np.ndarray, dict]:
    """
    Fetch live weather data (precipitation) for the given bounding box.
    
    This is a placeholder function. In production, you would:
    1. Call NOAA GFS API or similar weather service
    2. Download GRIB/NetCDF file for the region
    3. Use Xarray with cfgrib to read the precipitation data
    4. Extract the bounding box region
    
    Args:
        min_lon, min_lat, max_lon, max_lat: Bounding box coordinates
    
    Returns:
        Tuple of (precipitation_array, metadata_dict)
        - precipitation_array: 2D numpy array [H, W]
        - metadata: dict with 'width', 'height', 'transform', 'crs'
    """
    # TODO: Replace with actual weather API call
    # Example structure for NOAA GFS:
    # 
    # url = f"{settings.WEATHER_API_URL}/gfs/gfs.t00z.pgrb2.0p25.f000"
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)
    #     with tempfile.NamedTemporaryFile(delete=False, suffix='.grib2') as f:
    #         f.write(response.content)
    #         grib_path = f.name
    # 
    # try:
    #     ds = xr.open_dataset(grib_path, engine='cfgrib', filter_by_keys={'shortName': 'tp'})
    #     # Extract bounding box
    #     # Warp to desired resolution
    #     # Return as numpy array
    # finally:
    #     os.unlink(grib_path)
    
    # Placeholder: Generate synthetic precipitation data
    # In production, this will come from actual weather API
    logger.warning("Using synthetic weather data. Replace with actual API call.")
    
    width, height = 512, 512
    # Generate random precipitation pattern (0-50mm)
    precipitation = np.random.rand(height, width) * 50
    
    # Create transform metadata (simplified)
    # In production, this comes from the actual GRIB/NetCDF file
    transform = rasterio.transform.from_bounds(
        min_lon, min_lat, max_lon, max_lat, width, height
    )
    
    metadata = {
        'width': width,
        'height': height,
        'transform': transform,
        'crs': CRS.from_epsg(4326),  # WGS84
    }
    
    return precipitation, metadata


def load_terrain_chip(
    terrain_path: str,
    weather_shape: Tuple[int, int],
    weather_transform: rasterio.Affine,
    weather_crs: CRS
) -> np.ndarray:
    """
    Load terrain elevation data for the specific region using Rasterio.
    
    This function:
    1. Opens the terrain.tif file
    2. Determines the bounding box needed from weather data
    3. Warps terrain to match the weather data's grid/resolution/CRS
    
    Args:
        terrain_path: Path to terrain_data.tif
        weather_shape: (height, width) of weather data
        weather_transform: Affine transform of weather data
        weather_crs: CRS of weather data
    
    Returns:
        2D numpy array of terrain elevation [H, W]
    """
    terrain_file = rasterio.open(terrain_path)
    
    try:
        # Get bounding box from weather data transform
        bounds = rasterio.transform.array_bounds(
            weather_shape[0], weather_shape[1], weather_transform
        )
        
        # Calculate transform to reproject terrain to match weather data
        dst_transform, dst_width, dst_height = calculate_default_transform(
            terrain_file.crs,
            weather_crs,
            terrain_file.width,
            terrain_file.height,
            left=bounds[0],
            bottom=bounds[1],
            right=bounds[2],
            top=bounds[3]
        )
        
        # Ensure output shape matches weather data
        if dst_height != weather_shape[0] or dst_width != weather_shape[1]:
            # Use weather transform directly if shapes don't match after calculation
            dst_transform = weather_transform
            dst_height, dst_width = weather_shape
        
        # Read terrain data (read full dataset for now - can optimize with windowed reading)
        terrain_data = terrain_file.read(1)
        
        # Reproject terrain to match weather data
        # Create destination array with exact weather data shape
        terrain_warped = np.zeros((weather_shape[0], weather_shape[1]), dtype=np.float32)
        
        reproject(
            source=terrain_data,
            destination=terrain_warped,
            src_transform=terrain_file.transform,
            src_crs=terrain_file.crs,
            dst_transform=weather_transform,
            dst_crs=weather_crs,
            resampling=Resampling.bilinear
        )
        
        return terrain_warped
    
    finally:
        terrain_file.close()


def array_to_png(arr: np.ndarray, colormap: str = 'viridis') -> bytes:
    """
    Convert a 2D numpy array (flood prediction) to PNG image bytes.
    
    Args:
        arr: 2D numpy array with values 0-1 (flood risk)
        colormap: Matplotlib colormap name (e.g., 'viridis', 'hot', 'coolwarm')
    
    Returns:
        PNG image bytes
    """
    # Normalize array to 0-255
    arr_uint8 = (arr * 255).astype(np.uint8)
    
    # Apply colormap (using PIL's built-in colormaps or custom)
    # For now, use grayscale, but you can enhance with color mapping
    image = Image.fromarray(arr_uint8, mode='L')
    
    # Convert to RGB for better visualization
    # You can apply a custom colormap here (e.g., red for high risk, blue for low)
    image_rgb = image.convert('RGB')
    
    # Create a colormapped version
    # Simple approach: map low (0) -> blue, high (1) -> red
    arr_rgb = np.zeros((*arr.shape, 3), dtype=np.uint8)
    arr_rgb[:, :, 0] = arr_uint8  # Red channel increases with risk
    arr_rgb[:, :, 2] = 255 - arr_uint8  # Blue channel decreases with risk
    arr_rgb[:, :, 1] = 0  # Green channel
    
    image_colored = Image.fromarray(arr_rgb, mode='RGB')
    
    # Convert to PNG bytes
    img_bytes = io.BytesIO()
    image_colored.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()


@router.post("/predict")
async def predict_flood(request: BoundingBoxRequest):
    """
    Generate flood prediction for a given bounding box.
    
    Flow:
    1. Fetch live weather data for bounding box
    2. Load terrain data chip
    3. Align terrain with weather data
    4. Stack arrays and run AI model
    5. Return PNG image
    """
    flood_model_service = app.services.flood_model.flood_model_service
    if flood_model_service is None or flood_model_service.model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Server may still be initializing."
        )
    
    try:
        # Step 1: Fetch live weather data
        logger.info(f"Fetching weather data for bbox: {request.min_lon}, {request.min_lat}, {request.max_lon}, {request.max_lat}")
        precipitation, weather_metadata = fetch_weather_data(
            request.min_lon,
            request.min_lat,
            request.max_lon,
            request.max_lat
        )
        
        # Step 2: Load terrain chip
        terrain_path = settings.TERRAIN_DATA_PATH
        if not os.path.exists(terrain_path):
            logger.warning(f"Terrain file not found at {terrain_path}. Using synthetic data.")
            # Generate synthetic terrain (placeholder)
            terrain = np.random.rand(precipitation.shape[0], precipitation.shape[1]) * 1000
        else:
            terrain = load_terrain_chip(
                terrain_path,
                (precipitation.shape[0], precipitation.shape[1]),
                weather_metadata['transform'],
                weather_metadata['crs']
            )
        
        # Step 3 & 4: Align data (already aligned in load_terrain_chip) and run model
        logger.info("Running flood prediction model...")
        flood_prediction = flood_model_service.predict(precipitation, terrain)
        
        # Step 5: Convert to PNG
        png_bytes = array_to_png(flood_prediction)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(png_bytes),
            media_type="image/png",
            headers={
                "X-Bounds-MinLon": str(request.min_lon),
                "X-Bounds-MinLat": str(request.min_lat),
                "X-Bounds-MaxLon": str(request.max_lon),
                "X-Bounds-MaxLat": str(request.max_lat),
            }
        )
    
    except Exception as e:
        logger.error(f"Error generating flood prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate prediction: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": flood_model_service is not None and flood_model_service.model is not None
    }
