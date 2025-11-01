"""
ANUGA-based flood simulation service.
Uses physics-based shallow water equation simulation for flood prediction.
"""
import logging
import numpy as np
from typing import Tuple, Optional
import tempfile
import os
from pathlib import Path

logger = logging.getLogger(__name__)

try:
    import anuga
    ANUGA_AVAILABLE = True
except ImportError:
    ANUGA_AVAILABLE = False
    logger.warning("ANUGA not installed. Install with: conda install -c conda-forge anuga")


class AnugaSimulator:
    """
    Service for running ANUGA shallow water equation simulations.
    
    ANUGA simulates flood inundation based on:
    - Terrain elevation (bathymetry/topography)
    - Rainfall/precipitation input
    - Initial water conditions
    """
    
    def __init__(self):
        """Initialize ANUGA simulator."""
        self.available = ANUGA_AVAILABLE
        if not self.available:
            logger.warning("ANUGA not available. Flood simulations will use fallback method.")
    
    def simulate_flood(
        self,
        precipitation: np.ndarray,
        terrain: np.ndarray,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float
    ) -> np.ndarray:
        """
        Run ANUGA flood simulation.
        
        Args:
            precipitation: 2D array of precipitation/rainfall rates (mm/hour)
            terrain: 2D array of terrain elevation (meters)
            min_lon, min_lat, max_lon, max_lat: Bounding box coordinates
        
        Returns:
            2D numpy array of water depth/flood risk (0-1 normalized)
        """
        if not self.available:
            # Fallback: simple heuristic based on precipitation and terrain
            logger.warning("ANUGA not available, using simplified flood estimation")
            return self._simple_flood_estimation(precipitation, terrain)
        
        try:
            return self._run_anuga_simulation(precipitation, terrain, min_lon, min_lat, max_lon, max_lat)
        except Exception as e:
            logger.error(f"Error running ANUGA simulation: {e}", exc_info=True)
            logger.warning("Falling back to simplified flood estimation")
            return self._simple_flood_estimation(precipitation, terrain)
    
    def _run_anuga_simulation(
        self,
        precipitation: np.ndarray,
        terrain: np.ndarray,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float
    ) -> np.ndarray:
        """
        Run actual ANUGA shallow water equation simulation.
        
        This creates a mesh, sets boundary conditions, and runs the simulation.
        """
        logger.info("Starting ANUGA flood simulation...")
        
        # Create temporary directory for ANUGA output
        temp_dir = tempfile.mkdtemp()
        
        try:
            # Create domain polygon (bounding box)
            boundary_polygon = [
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat]
            ]
            
            # Create ANUGA domain
            # Resolution based on array size
            height, width = precipitation.shape
            # Create mesh - ANUGA uses triangle mesh, we'll create a simple rectangular grid
            # For simplicity, we'll use a coarse mesh and interpolate results
            
            # Create mesh using points
            # Generate mesh points
            n_points_x = max(20, min(width // 10, 50))  # Adaptive mesh size
            n_points_y = max(20, min(height // 10, 50))
            
            # Create domain
            domain_name = os.path.join(temp_dir, "flood_simulation")
            
            # Create mesh points
            x = np.linspace(min_lon, max_lon, n_points_x)
            y = np.linspace(min_lat, max_lat, n_points_y)
            X, Y = np.meshgrid(x, y)
            
            # Interpolate terrain to mesh points
            from scipy.interpolate import griddata
            terrain_points = griddata(
                np.column_stack([
                    np.linspace(min_lon, max_lon, width),
                    np.linspace(max_lat, min_lat, height)
                ]),
                terrain.flatten(),
                (X.flatten(), Y.flatten()),
                method='linear',
                fill_value=terrain.min()
            )
            
            # Interpolate precipitation to mesh points
            precip_points = griddata(
                np.column_stack([
                    np.linspace(min_lon, max_lon, width),
                    np.linspace(max_lat, min_lat, height)
                ]),
                precipitation.flatten(),
                (X.flatten(), Y.flatten()),
                method='linear',
                fill_value=0.0
            )
            
            # Create ANUGA domain using simple rectangular mesh
            # ANUGA API: create_domain_from_regions or create_domain_from_file
            try:
                # Try modern ANUGA API
                domain = anuga.create_domain_from_regions(
                    boundary_polygon,
                    boundary_tags={'exterior': [0, 1, 2, 3]},
                    maximum_triangle_area=0.001,
                    mesh_filename=domain_name,
                    interior_regions=[]
                )
            except (AttributeError, TypeError):
                # Fallback to alternative API or manual mesh creation
                logger.warning("ANUGA API mismatch, using simplified approach")
                raise NotImplementedError("ANUGA API needs version-specific implementation")
            
            # Set terrain (bathymetry) - ANUGA uses elevation function
            def topography(x, y):
                """Terrain function for ANUGA."""
                z = griddata(
                    (X.flatten(), Y.flatten()),
                    terrain_points,
                    (x, y),
                    method='linear',
                    fill_value=terrain.min()
                )
                return -z  # ANUGA: negative = above sea level
            
            domain.set_quantity('elevation', topography)
            domain.set_quantity('friction', 0.03)  # Manning's friction coefficient
            domain.set_quantity('stage', domain.get_quantity('elevation'))  # Initial: dry
            
            # Set boundary conditions (reflective walls)
            Br = anuga.Reflective_boundary(domain)
            domain.set_boundary({'exterior': Br})
            
            # Set rainfall (precipitation input)
            max_precip_mm_per_hour = precipitation.max()
            rainfall_rate_ms = max_precip_mm_per_hour / (1000.0 * 3600.0)  # Convert to m/s
            
            def rainfall_function(t):
                """Constant rainfall rate."""
                return rainfall_rate_ms
            
            domain.set_rainfall_function(rainfall_function)
            
            # Run simulation (1 hour)
            final_time = 3600.0  # seconds
            for t in domain.evolve(yieldstep=600.0, finaltime=final_time):
                domain.print_timestep()
            
            # Extract water depth results
            stage = domain.get_quantity('stage').centroid_values
            elevation = domain.get_quantity('elevation').centroid_values
            depth = np.maximum(stage - elevation, 0.0)  # Water depth (non-negative)
            
            # Interpolate back to original grid
            centroid_coords = domain.get_centroid_coordinates()
            
            output_grid = griddata(
                (centroid_coords[:, 0], centroid_coords[:, 1]),
                depth,
                (X.flatten(), Y.flatten()),
                method='linear',
                fill_value=0.0
            )
            
            # Resample to original resolution
            from scipy.ndimage import zoom
            output_array = output_grid.reshape(n_points_y, n_points_x)
            
            if output_array.shape != precipitation.shape:
                zoom_factors = (precipitation.shape[0] / output_array.shape[0],
                               precipitation.shape[1] / output_array.shape[1])
                output_array = zoom(output_array, zoom_factors, order=1)
            
            # Normalize to 0-1 range (flood risk)
            if output_array.max() > 0:
                output_array = output_array / output_array.max()
            
            logger.info(f"ANUGA simulation complete. Max water depth: {depth.max():.3f}m")
            
            return output_array
            
        finally:
            # Cleanup temporary files
            import shutil
            try:
                shutil.rmtree(temp_dir)
            except:
                pass
    
    def _simple_flood_estimation(
        self,
        precipitation: np.ndarray,
        terrain: np.ndarray
    ) -> np.ndarray:
        """
        Simplified flood estimation when ANUGA is not available.
        
        Uses heuristic: flood risk ∝ precipitation / (terrain + 1)
        Lower terrain + higher precipitation = higher flood risk
        """
        # Use actual values instead of normalized to preserve differences
        # Precipitation in mm, terrain in meters
        
        # Normalize precipitation to reasonable range (0-100mm)
        precip_clipped = np.clip(precipitation, 0, 100)
        precip_scaled = precip_clipped / 100.0  # 0-1 range
        
        # Normalize terrain - invert so lower = higher risk
        # Assume terrain range 0-5000m (adjust if needed)
        terrain_clipped = np.clip(terrain, 0, 5000)
        terrain_scaled = 1.0 - (terrain_clipped / 5000.0)  # Inverted: low terrain = high value
        
        # Combine: high precip + low terrain = high risk
        # Use multiplication for better contrast
        flood_risk = precip_scaled * (0.5 + 0.5 * terrain_scaled)
        
        # Apply non-linear scaling to increase contrast
        flood_risk = np.power(flood_risk, 0.7)  # Gamma correction to boost mid-high values
        
        # Ensure good dynamic range
        flood_risk_min = np.percentile(flood_risk, 5)  # Use percentile to ignore outliers
        flood_risk_max = np.percentile(flood_risk, 95)
        
        if flood_risk_max > flood_risk_min:
            flood_risk = (flood_risk - flood_risk_min) / (flood_risk_max - flood_risk_min)
        
        # Normalize to 0-1
        flood_risk = np.clip(flood_risk, 0.0, 1.0)
        
        return flood_risk


# Global simulator instance
anuga_simulator: Optional[AnugaSimulator] = None

