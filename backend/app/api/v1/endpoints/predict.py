"""
Flood prediction API endpoint.
"""
import io
import logging
import asyncio
from typing import Tuple
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import numpy as np
import rasterio
from rasterio import transform as rasterio_transform
from rasterio.warp import reproject, Resampling, calculate_default_transform
from rasterio.crs import CRS
from PIL import Image
import os
import httpx
try:
    from scipy.interpolate import griddata
except ImportError:
    # Fallback if scipy not installed
    griddata = None

from app.schemas.prediction import BoundingBoxRequest
import app.services.flood_model
from app.services.anuga_simulator import AnugaSimulator
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize ANUGA simulator
anuga_simulator = AnugaSimulator()


async def fetch_weather_data(
    min_lon: float,
    min_lat: float,
    max_lon: float,
    max_lat: float
) -> Tuple[np.ndarray, dict]:
    """
    Fetch live weather data (precipitation) for the given bounding box from Open-Meteo.
    
    Uses Open-Meteo API (free, no API key required) to get precipitation forecasts.
    
    Args:
        min_lon, min_lat, max_lon, max_lat: Bounding box coordinates
    
    Returns:
        Tuple of (precipitation_array, metadata_dict)
    """
    width, height = settings.PREDICTION_IMAGE_WIDTH, settings.PREDICTION_IMAGE_HEIGHT
    
    try:
        # Create a grid of points to sample across the bounding box
        # Sample every ~50km (adjust based on bounding box size)
        lat_range = max_lat - min_lat
        lon_range = max_lon - min_lon
        
        # Calculate grid spacing (adaptive based on area size)
        # Target ~20-30 points total for efficiency
        n_points = min(25, max(9, int((lat_range + lon_range) * 10)))
        grid_size = int(np.sqrt(n_points))
        
        # Generate sampling grid
        lats = np.linspace(min_lat, max_lat, grid_size)
        lons = np.linspace(min_lon, max_lon, grid_size)
        lat_grid, lon_grid = np.meshgrid(lats, lons)
        
        # Flatten for API calls
        sample_lats = lat_grid.flatten()
        sample_lons = lon_grid.flatten()
        
        logger.info(f"Fetching weather data from Open-Meteo for {len(sample_lats)} points...")
        
        # Fetch precipitation data for all points
        precipitation_values = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Open-Meteo allows batch requests, but we'll do individual calls
            # to ensure we get accurate data for each point
            tasks = []
            for lat, lon in zip(sample_lats, sample_lons):
                url = "https://api.open-meteo.com/v1/forecast"
                params = {
                    "latitude": float(lat),
                    "longitude": float(lon),
                    "hourly": "precipitation",  # Get hourly precipitation
                    "forecast_days": 1,  # Get next 24 hours
                    "timezone": "UTC"
                }
                tasks.append(client.get(url, params=params))
            
            # Execute all requests in parallel
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Extract precipitation data
            successful_fetches = 0
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    logger.warning(f"Failed to fetch weather for point {i}: {response}")
                    precipitation_values.append(0.0)
                    continue
                
                try:
                    if response.status_code != 200:
                        logger.warning(f"API returned status {response.status_code} for point {i}")
                        precipitation_values.append(0.0)
                        continue
                    
                    data = response.json()
                    
                    # Debug: log response structure if missing data
                    if "hourly" not in data:
                        logger.warning(f"Open-Meteo response missing 'hourly' key for point {i}. Keys: {list(data.keys())}")
                        
                    if "hourly" in data and "precipitation" in data["hourly"]:
                        # Get maximum precipitation in next 24 hours (flood prediction)
                        precip_hourly = data["hourly"]["precipitation"]
                        if precip_hourly and len(precip_hourly) > 0:
                            # Filter out None values and convert to float
                            precip_values = [float(p) if p is not None and p is not None else 0.0 for p in precip_hourly]
                            max_precip = max(precip_values) if precip_values else 0.0
                            precipitation_values.append(float(max_precip))
                            successful_fetches += 1
                        else:
                            logger.warning(f"Empty precipitation array for point {i}")
                            precipitation_values.append(0.0)
                    elif "hourly" in data:
                        logger.warning(f"Open-Meteo response missing 'precipitation' in hourly data for point {i}. Available: {list(data['hourly'].keys())}")
                        precipitation_values.append(0.0)
                    else:
                        precipitation_values.append(0.0)
                except (KeyError, ValueError, IndexError, TypeError) as e:
                    logger.warning(f"Error parsing weather data for point {i}: {e}")
                    precipitation_values.append(0.0)
            
            if successful_fetches == 0:
                logger.error("All Open-Meteo API calls failed - no successful fetches")
                raise Exception("All Open-Meteo API calls failed")
            
            logger.info(f"Successfully fetched weather data from {successful_fetches}/{len(sample_lats)} points from Open-Meteo")
        
        # Reshape to grid
        precip_grid = np.array(precipitation_values).reshape(grid_size, grid_size)
        
        # Interpolate to desired output resolution
        if griddata is not None:
            # Create output grid coordinates
            output_lats = np.linspace(max_lat, min_lat, height)  # Note: reverse for image coords
            output_lons = np.linspace(min_lon, max_lon, width)
            output_lat_grid, output_lon_grid = np.meshgrid(output_lats, output_lons)
            
            # Flatten input and output for interpolation
            input_points = np.column_stack([lon_grid.flatten(), lat_grid.flatten()])
            output_points = np.column_stack([output_lon_grid.flatten(), output_lat_grid.flatten()])
            
            # Interpolate using linear interpolation
            precipitation = griddata(
                input_points,
                precip_grid.flatten(),
                output_points,
                method='linear',
                fill_value=0.0
            ).reshape(height, width)
            
            # Handle any NaN values
            precipitation = np.nan_to_num(precipitation, nan=0.0)
        else:
            # Simple upsampling if scipy not available
            from PIL import Image
            precip_img = Image.fromarray(precip_grid.astype(np.float32))
            precip_img = precip_img.resize((width, height), Image.Resampling.BILINEAR)
            precipitation = np.array(precip_img, dtype=np.float32)
        
        logger.info(f"Successfully fetched weather data. Max precipitation: {precipitation.max():.2f}mm")
        weather_source = 'Open-Meteo'
        
    except Exception as e:
        logger.error(f"Error fetching weather data from Open-Meteo: {e}", exc_info=True)
        logger.warning("Falling back to synthetic data with realistic typhoon pattern.")
        
        # Fallback to synthetic data with realistic typhoon-like pattern
        # Create a spiral/cyclone pattern to simulate typhoon precipitation
        center_x, center_y = width // 2, height // 2
        x = np.arange(width)
        y = np.arange(height)
        X, Y = np.meshgrid(x, y)
        
        # Distance from center
        dist = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
        max_dist = np.sqrt(center_x**2 + center_y**2)
        dist_norm = dist / max_dist
        
        # Angle for spiral effect
        angle = np.arctan2(Y - center_y, X - center_x)
        
        # Create typhoon-like spiral pattern
        # Outer bands with higher precipitation
        spiral_pattern = np.sin(angle * 3 + dist_norm * 10) * 0.5 + 0.5
        
        # Add distance-based decay (more rain near center, less at edges)
        distance_decay = np.exp(-dist_norm * 2)
        
        # Combine: spiral pattern + distance decay + random variation
        precipitation = (spiral_pattern * distance_decay * 40) + np.random.rand(height, width) * 15
        precipitation = np.clip(precipitation, 5, 60)  # Ensure minimum 5mm, max 60mm
        
        # Add some high-intensity zones (typhoon core)
        core_mask = dist_norm < 0.2
        precipitation[core_mask] = np.clip(precipitation[core_mask] + 30, 0, 80)
        
        logger.info(f"Generated synthetic typhoon pattern. Max: {precipitation.max():.2f}mm, Avg: {precipitation.mean():.2f}mm")
        weather_source = 'Synthetic (Typhoon Simulation)'
    
    # Create transform metadata
    transform = rasterio_transform.from_bounds(
        min_lon, min_lat, max_lon, max_lat, width, height
    )
    
    metadata = {
        'width': width,
        'height': height,
        'transform': transform,
        'crs': CRS.from_epsg(4326),  # WGS84
        'source': weather_source,
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
    
    Args:
        terrain_path: Path to terrain_data.tif
        weather_shape: (height, width) of weather data
        weather_transform: Affine transform of weather data
        weather_crs: CRS of weather data
    
    Returns:
        2D numpy array of terrain elevation [H, W]
    """
    if not os.path.exists(terrain_path):
        logger.warning(f"Terrain file not found. Using synthetic data.")
        return np.random.rand(weather_shape[0], weather_shape[1]) * 1000
    
    terrain_file = rasterio.open(terrain_path)
    
    try:
        # Get bounding box from weather data transform
        bounds = rasterio_transform.array_bounds(
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
            dst_transform = weather_transform
            dst_height, dst_width = weather_shape
        
        # Read terrain data
        terrain_data = terrain_file.read(1)
        
        # Reproject terrain to match weather data
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


def array_to_png(arr: np.ndarray) -> bytes:
    """
    Convert a 2D numpy array (flood prediction) to PNG image bytes.
    
    Args:
        arr: 2D numpy array with values 0-1 (flood risk)
    
    Returns:
        PNG image bytes
    """
    # Ensure array is valid
    arr = np.nan_to_num(arr, nan=0.0)
    arr = np.clip(arr, 0.0, 1.0)
    
    # Use percentile-based normalization for better contrast (ignore outliers)
    arr_p2 = np.percentile(arr, 2)
    arr_p98 = np.percentile(arr, 98)
    
    if arr_p98 > arr_p2:
        arr_normalized = (arr - arr_p2) / (arr_p98 - arr_p2)
        arr_normalized = np.clip(arr_normalized, 0.0, 1.0)
    else:
        # If all values similar, use full range
        arr_min = arr.min()
        arr_max = arr.max()
        if arr_max > arr_min:
            arr_normalized = (arr - arr_min) / (arr_max - arr_min)
        else:
            arr_normalized = np.zeros_like(arr)
    
    # Apply contrast enhancement (gamma correction)
    arr_normalized = np.power(arr_normalized, 0.8)  # Boost mid-range values
    
    arr_uint8 = (arr_normalized * 255).astype(np.uint8)
    
    # Create colormapped version with better color distribution
    # Low (0) = dark blue, Mid (0.33) = green, High (0.66) = yellow, Very High (1) = red
    arr_rgb = np.zeros((*arr.shape, 3), dtype=np.uint8)
    
    # Vectorized color mapping for better performance
    val_flat = arr_normalized.flatten()
    r = np.zeros_like(val_flat)
    g = np.zeros_like(val_flat)
    b = np.zeros_like(val_flat)
    
    # Low risk: Blue (0.0-0.33)
    mask_low = val_flat < 0.33
    t_low = val_flat[mask_low] / 0.33
    r[mask_low] = 0
    g[mask_low] = (t_low * 100).astype(np.uint8)  # Gradually add green
    b[mask_low] = 255
    
    # Medium risk: Green to Yellow (0.33-0.66)
    mask_med = (val_flat >= 0.33) & (val_flat < 0.66)
    t_med = (val_flat[mask_med] - 0.33) / 0.33
    r[mask_med] = (t_med * 255).astype(np.uint8)
    g[mask_med] = 255
    b[mask_med] = ((1 - t_med) * 100).astype(np.uint8)
    
    # High risk: Yellow to Red (0.66-1.0)
    mask_high = val_flat >= 0.66
    t_high = (val_flat[mask_high] - 0.66) / 0.34
    r[mask_high] = 255
    g[mask_high] = ((1 - t_high) * 255).astype(np.uint8)
    b[mask_high] = 0
    
    arr_rgb = np.stack([r.reshape(arr.shape), g.reshape(arr.shape), b.reshape(arr.shape)], axis=2).astype(np.uint8)
    
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
        precipitation, weather_metadata = await fetch_weather_data(
            request.min_lon,
            request.min_lat,
            request.max_lon,
            request.max_lat
        )
        
        # Track weather source
        weather_source = weather_metadata.get('source', 'Synthetic')
        
        # Step 2: Load terrain chip
        terrain_path = settings.TERRAIN_DATA_PATH
        terrain = load_terrain_chip(
            terrain_path,
            (precipitation.shape[0], precipitation.shape[1]),
            weather_metadata['transform'],
            weather_metadata['crs']
        )
        
        # Step 3 & 4: Run prediction (ANUGA physics-based simulation)
        logger.info("Running flood prediction simulation...")
        
        # Use ANUGA for physics-based flood simulation
        try:
            if anuga_simulator.available:
                logger.info("Using ANUGA shallow water equation simulator")
                flood_prediction = anuga_simulator.simulate_flood(
                    precipitation,
                    terrain,
                    request.min_lon,
                    request.min_lat,
                    request.max_lon,
                    request.max_lat
                )
            else:
                # Fallback to U-Net model if ANUGA not available
                logger.info("ANUGA not available, using simplified estimation")
                flood_prediction = anuga_simulator._simple_flood_estimation(precipitation, terrain)
        except Exception as e:
            logger.error(f"Error in flood prediction: {e}", exc_info=True)
            # Final fallback: simple heuristic
            logger.warning("Using final fallback: simple flood estimation")
            flood_prediction = anuga_simulator._simple_flood_estimation(precipitation, terrain)
        
        # Ensure prediction is valid and normalized
        flood_prediction = np.nan_to_num(flood_prediction, nan=0.0)
        flood_prediction = np.clip(flood_prediction, 0.0, 1.0)
        
        # Use percentile-based normalization for better contrast
        # This prevents everything from looking the same if values are clustered
        pred_min = np.percentile(flood_prediction, 2)  # Ignore bottom 2%
        pred_max = np.percentile(flood_prediction, 98)  # Ignore top 2%
        
        if pred_max > pred_min:
            flood_prediction = (flood_prediction - pred_min) / (pred_max - pred_min)
            flood_prediction = np.clip(flood_prediction, 0.0, 1.0)
        else:
            # If all values are same, add some variation
            flood_prediction = flood_prediction * 0.3  # Make it mostly low risk
        
        logger.info(f"Flood prediction generated. Range: [{flood_prediction.min():.3f}, {flood_prediction.max():.3f}], Percentiles: [{pred_min:.3f}, {pred_max:.3f}]")
        
        # Step 5: Convert to PNG
        png_bytes = array_to_png(flood_prediction)
        
        # Calculate weather stats for display
        max_precip = float(precipitation.max())
        avg_precip = float(precipitation.mean())
        min_precip = float(precipitation.min())
        
        logger.info(f"Weather stats - Source: {weather_source}, Max: {max_precip:.2f}mm, Avg: {avg_precip:.2f}mm, Min: {min_precip:.2f}mm")
        
        # Return as streaming response
        response_headers = {
            "X-Bounds-MinLon": str(request.min_lon),
            "X-Bounds-MinLat": str(request.min_lat),
            "X-Bounds-MaxLon": str(request.max_lon),
            "X-Bounds-MaxLat": str(request.max_lat),
            "X-Weather-MaxPrecip": str(max_precip),
            "X-Weather-AvgPrecip": str(avg_precip),
            "X-Weather-MinPrecip": str(min_precip),
            "X-Weather-Source": weather_source,
        }
        
        logger.debug(f"Sending response headers: {response_headers}")
        
        return StreamingResponse(
            io.BytesIO(png_bytes),
            media_type="image/png",
            headers=response_headers
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
    import app.services.flood_model
    flood_model_service = app.services.flood_model.flood_model_service
    return {
        "status": "healthy",
        "model_loaded": flood_model_service is not None and flood_model_service.model is not None
    }

