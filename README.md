# FloodLert AI

Real-time flood prediction web application based on active typhoon data and terrain analysis.

## Architecture Overview

FloodLert AI is a **stateless, map-centric web application** that provides real-time flood predictions by:

1. **Frontend (React + Mapbox)**: User pans the map → sends bounding box to backend
2. **Backend (FastAPI)**: Receives bounding box → fetches live weather data (NOAA) → loads terrain chip → aligns data → runs AI model → returns PNG image
3. **AI Model (PyTorch U-Net)**: Takes stacked arrays (precipitation + terrain) → outputs flood risk heatmap
4. **Visualization**: Frontend displays PNG as raster layer on Mapbox map

## Technology Stack

### Backend
- **FastAPI**: Async web framework
- **PyTorch**: Deep learning framework with U-Net architecture
- **Xarray + cfgrib**: Reading GRIB/NetCDF weather data from NOAA
- **Rasterio**: Reading and warping terrain data from local TIFF files
- **Pillow**: Converting numpy arrays to PNG images

### Frontend
- **React + Vite**: Frontend framework
- **Mapbox GL JS**: Interactive map with raster layer support
- **TypeScript**: Type-safe JavaScript

## Setup Instructions

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Add model and terrain data**:
   - Place your trained U-Net model at `backend/data/flood_model.pth`
   - Place terrain data at `backend/data/terrain_data.tif`

3. **Configure environment** (optional):
   Create `.env` file in `backend/`:
   ```
   MODEL_PATH=data/flood_model.pth
   TERRAIN_DATA_PATH=data/terrain_data.tif
   WEATHER_API_URL=https://your-weather-api-url.com
   WEATHER_API_KEY=your-api-key
   ```

4. **Run the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**:
   Create `.env` file in `frontend/`:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_MAPBOX_TOKEN=your-mapbox-token
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Development Notes

### Weather Data Integration

The `fetch_weather_data()` function in `backend/app/api/v1/endpoints/predict.py` currently uses synthetic data. To integrate real weather data:

1. Set up access to NOAA GFS data or similar weather API
2. Implement GRIB file download for the bounding box
3. Use Xarray with cfgrib engine to read precipitation data
4. Extract and warp to match terrain resolution

Example structure (commented in code):
```python
# Download GRIB file
# Use xr.open_dataset(grib_path, engine='cfgrib')
# Extract precipitation variable
# Warp to bounding box
```

### Model Training

The U-Net model expects:
- **Input**: 2-channel tensor (precipitation + terrain elevation)
- **Output**: Single-channel flood risk heatmap (0-1 values)

Train your model and save as `flood_model.pth` using PyTorch's standard save format.

### API Endpoints

- `POST /api/v1/predict`: Generate flood prediction for bounding box
  - Request: `{ min_lon, min_lat, max_lon, max_lat }`
  - Response: PNG image with bounds in headers
- `GET /health`: Health check endpoint
- `GET /`: API information

## Project Structure

```
floodlert-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/predict.py  # Prediction endpoint
│   │   ├── services/flood_model.py      # Model loading & inference
│   │   ├── models/unet.py               # U-Net architecture
│   │   └── ...
│   └── data/                             # Model & terrain data
└── frontend/
    ├── src/
    │   ├── components/Map.tsx           # Mapbox integration
    │   ├── api/floodApi.ts              # API client
    │   └── ...
```

## License

[Your License Here]
