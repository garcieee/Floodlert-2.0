"""
Service for loading and running the flood prediction U-Net model.
"""
import torch
import numpy as np
from pathlib import Path
from typing import Optional
import logging
from app.models.unet import UNet

logger = logging.getLogger(__name__)


class FloodModelService:
    """Service for managing the flood prediction model."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the flood model service.
        
        Args:
            model_path: Path to the pre-trained model file (.pth)
        """
        self.model: Optional[torch.nn.Module] = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = model_path or "data/flood_model.pth"
        logger.info(f"Using device: {self.device}")
    
    def load_model(self) -> None:
        """Load the pre-trained U-Net model from disk."""
        model_path = Path(self.model_path)
        
        if not model_path.exists():
            logger.warning(f"Model file not found at {model_path}. Initializing untrained model.")
            self.model = UNet(in_channels=2, out_channels=1).to(self.device)
            self.model.eval()
            return
        
        try:
            # Initialize model architecture
            self.model = UNet(in_channels=2, out_channels=1).to(self.device)
            
            # Load state dict
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            elif isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            else:
                state_dict = checkpoint
            
            self.model.load_state_dict(state_dict, strict=False)
            self.model.eval()
            
            logger.info(f"Model loaded successfully from {model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.warning("Falling back to untrained model.")
            self.model = UNet(in_channels=2, out_channels=1).to(self.device)
            self.model.eval()
    
    def predict(self, precipitation: np.ndarray, terrain: np.ndarray) -> np.ndarray:
        """
        Run flood prediction inference.
        
        Args:
            precipitation: 2D numpy array of precipitation data (shape: [H, W])
            terrain: 2D numpy array of terrain elevation (shape: [H, W])
        
        Returns:
            2D numpy array of flood risk predictions (shape: [H, W], values 0-1)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Ensure arrays have the same shape
        if precipitation.shape != terrain.shape:
            raise ValueError(
                f"Shape mismatch: precipitation {precipitation.shape} != terrain {terrain.shape}"
            )
        
        # Normalize inputs (adjust based on your data ranges)
        precip_norm = self._normalize(precipitation, min_val=0, max_val=200)
        terrain_norm = self._normalize(terrain, min_val=terrain.min(), max_val=terrain.max())
        
        # Stack into channels: (H, W, 2)
        stacked = np.stack([precip_norm, terrain_norm], axis=-1)
        
        # Convert to tensor: (1, 2, H, W) - batch, channels, height, width
        tensor = torch.from_numpy(stacked).permute(2, 0, 1).unsqueeze(0).float()
        tensor = tensor.to(self.device)
        
        # Run inference
        with torch.no_grad():
            output = self.model(tensor)
            # Remove batch dimension and channel dimension: (1, 1, H, W) -> (H, W)
            prediction = output.squeeze().cpu().numpy()
        
        return prediction
    
    @staticmethod
    def _normalize(arr: np.ndarray, min_val: float, max_val: float) -> np.ndarray:
        """Normalize array to [0, 1] range."""
        arr_clipped = np.clip(arr, min_val, max_val)
        if max_val == min_val:
            return np.zeros_like(arr_clipped)
        return (arr_clipped - min_val) / (max_val - min_val)


# Global model service instance (will be initialized at startup)
flood_model_service: Optional[FloodModelService] = None

