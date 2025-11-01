"""
Main FastAPI application for FloodLert AI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1.endpoints import predict
from app.core.config import settings
from app.services.flood_model import FloodModelService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time flood prediction based on active typhoon data",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Bounds-MinLon",
        "X-Bounds-MinLat",
        "X-Bounds-MaxLon",
        "X-Bounds-MaxLat",
        "X-Weather-MaxPrecip",
        "X-Weather-AvgPrecip",
        "X-Weather-MinPrecip",
        "X-Weather-Source",
    ],
)

# Include routers
app.include_router(
    predict.router,
    prefix=settings.API_V1_STR,
    tags=["predictions"]
)


@app.on_event("startup")
async def startup_event():
    """Load the flood prediction model when the server starts."""
    logger.info("Starting FloodLert AI server...")
    logger.info("Loading flood prediction model...")
    
    model_service = FloodModelService(model_path=settings.MODEL_PATH)
    model_service.load_model()
    
    # Make it globally accessible
    import app.services.flood_model
    app.services.flood_model.flood_model_service = model_service
    
    logger.info("Server startup complete. Model loaded and ready.")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown."""
    logger.info("Shutting down FloodLert AI server...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    import app.services.flood_model
    flood_model_service = app.services.flood_model.flood_model_service
    return {
        "status": "healthy",
        "model_loaded": flood_model_service is not None and flood_model_service.model is not None
    }

