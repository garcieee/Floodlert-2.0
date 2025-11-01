# FloodLert AI

Real-time flood prediction web application based on active typhoon data and terrain analysis using AI-powered U-Net models.

## 🌊 Overview

FloodLert AI is a **stateless, map-centric web application** that provides real-time flood predictions by combining:
- **Live weather data** (precipitation forecasts from NOAA)
- **Terrain elevation data** (local terrain datasets)
- **AI-powered predictions** (PyTorch U-Net deep learning model)

The application automatically generates flood risk heatmaps as you pan and zoom the interactive map, providing instant visual feedback on potential flood zones.

## 🚀 Features

- ✅ **Real-time Predictions** - Automatically generates flood predictions as you explore the map
- ✅ **Interactive Map** - Pan and zoom with Mapbox GL JS for smooth navigation
- ✅ **AI-Powered** - Uses PyTorch U-Net model for accurate flood risk assessment
- ✅ **Visual Overlays** - Color-coded flood risk heatmaps (red = high risk, blue = low risk)
- ✅ **Stateless Architecture** - No database required, pure compute engine
- ✅ **Modern UI** - Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### Data Flow

1. **User pans map** → Frontend sends bounding box coordinates to backend
2. **Backend receives bbox** → Fetches live weather data (NOAA API)
3. **Load terrain chip** → Reads terrain.tif using Rasterio (only needed region)
4. **Align data** → Warps terrain to match weather data grid/resolution/CRS
5. **AI inference** → Stacks precipitation + terrain → U-Net model → flood risk heatmap
6. **Generate PNG** → Converts numpy array to PNG image
7. **Frontend displays** → Adds PNG as raster layer on Mapbox map

### Technology Stack

**Backend:**
- FastAPI - Async web framework
- **ANUGA** - Physics-based shallow water equation simulator for flood prediction (primary method)
- PyTorch - Deep learning framework with U-Net architecture (optional/fallback)
- Xarray + cfgrib - Reading GRIB/NetCDF weather data from NOAA
- Rasterio - Reading and warping terrain data from local TIFF files
- Pillow - Converting numpy arrays to PNG images

**Frontend:**
- React + TypeScript - Frontend framework
- MapLibre GL JS - Interactive maps with raster layer support (free, open-source)
- Tailwind CSS - Utility-first CSS framework
- Vite - Fast build tool and dev server

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- ✅ **No API keys needed!** Using MapLibre GL (free, open-source)

### Running the Application

#### **Option 1: Using Batch Scripts (Windows - Easiest)**

**Terminal 1 - Backend:**
```powershell
cd backend
.\install.bat    # First time only - installs everything
.\run.bat        # Starts the server
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install      # First time only
npm run dev      # Starts on http://localhost:5173
```

#### **Option 2: Manual Commands**

**Terminal 1 - Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

#### **Open Browser:**
Navigate to `http://localhost:5173` and start exploring the map!

### Environment Setup (Optional)

**Create `frontend/.env` file (optional but recommended):**
```
VITE_API_BASE_URL=http://localhost:8000
```

**Note:** 
- ✅ **No API key needed!** - Using MapLibre GL with free OpenStreetMap tiles
- ✅ No credit card required
- ✅ No account signup needed

📖 **For details on optional APIs (weather, model, terrain), see [API_REQUIREMENTS.md](API_REQUIREMENTS.md)**

## 📁 Project Structure

```
FLOODLERT/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           └── predict.py      # Prediction API endpoint
│   │   ├── core/
│   │   │   └── config.py               # Configuration settings
│   │   ├── models/
│   │   │   └── unet.py                 # U-Net model architecture
│   │   ├── schemas/
│   │   │   └── prediction.py          # API request/response schemas
│   │   ├── services/
│   │   │   └── flood_model.py         # Model loading & inference
│   │   └── main.py                     # FastAPI application
│   ├── data/                           # Model & terrain data
│   ├── tests/                          # Test files
│   └── requirements.txt                # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── floodApi.ts            # API client
    │   ├── components/
    │   │   ├── Map.tsx                # Mapbox map component
    │   │   └── Legend.tsx             # Risk level legend
    │   ├── hooks/
    │   │   └── useFloodPrediction.ts  # Prediction hook
    │   ├── types/
    │   │   └── index.ts               # TypeScript types
    │   ├── styles/
    │   │   └── index.css              # Global styles
    │   ├── App.tsx                    # Main app component
    │   └── main.tsx                   # Entry point
    ├── public/                         # Static assets
    └── package.json                    # Node dependencies
```

## 🔧 Development

### API Endpoints

- `POST /api/v1/predict` - Generate flood prediction for bounding box
  - Request: `{ min_lon, min_lat, max_lon, max_lat }`
  - Response: PNG image with bounds in headers
- `GET /health` - Health check endpoint
- `GET /` - API information

### Flood Prediction Methods

The app supports two prediction methods:

**1. ANUGA (Physics-Based) - Default ✅**
- Uses shallow water equation simulation
- Physics-based, interpretable results
- No training required
- Install: `conda install -c conda-forge anuga`
- More info: https://github.com/anuga-community/anuga_core

**2. U-Net (ML-Based) - Optional**
- Requires trained model
- Input: 2-channel tensor (precipitation + terrain elevation)
- Output: Single-channel flood risk heatmap (0-1 values)
- Train your model and save as `flood_model.pth` using PyTorch's standard save format
- Place in `backend/data/` directory

**Getting Pre-trained U-Net Models:**
- Search Hugging Face: https://huggingface.co/models?search=flood+prediction
- Check GitHub: https://github.com/search?q=flood+prediction+unet
- Academic papers often release model weights

### Weather Data Integration

The `fetch_weather_data()` function in `backend/app/api/v1/endpoints/predict.py` currently uses synthetic data. To integrate real weather data:

1. Get API key from OpenWeatherMap (free) or NOAA GFS (free)
2. Update `fetch_weather_data()` function
3. Add API URL/key to `backend/.env`:
   ```
   WEATHER_API_URL=https://api.openweathermap.org/data/2.5
   WEATHER_API_KEY=your_key_here
   ```

📖 **See [API_REQUIREMENTS.md](API_REQUIREMENTS.md) for detailed integration steps**

### Terrain Data

Place terrain elevation data (GeoTIFF format) in `backend/data/terrain_data.tif`. Get free data from:
- USGS EarthExplorer: https://earthexplorer.usgs.gov/ (search for SRTM or ASTER GDEM)

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build  # Outputs to dist/
```

**Backend:**
Use a production WSGI server like gunicorn:
```bash
gunicorn app.main:app --workers 4 --bind 0.0.0.0:8000
```

## 🐛 Troubleshooting

### Backend Issues

- **Backend won't install?**
  - Make sure Python 3.11+ is installed: `python --version`
  - Try: `pip install --upgrade pip` first
  - Delete `venv` folder and run `.\install.bat` again

- **"Model not loaded" error**: App will use untrained model (this is okay for testing)
- **Port already in use?**: Change port in `run.bat`: `--port 8001`

### Frontend Issues

- **Map not displaying?**
  - Check browser console (F12) for errors
  - Make sure backend is running
  - Verify `VITE_API_BASE_URL` in `frontend/.env`

- **API connection errors**: 
  - Ensure backend is running on port 8000
  - Check `VITE_API_BASE_URL=http://localhost:8000` in `frontend/.env`

- **No predictions showing**: 
  - Check browser console for errors
  - Verify API is responding at http://localhost:8000/health

### Verify It's Working

1. **Backend:** Open http://localhost:8000/docs - you should see FastAPI docs
2. **Backend Health:** Open http://localhost:8000/health - should return `{"status": "healthy", "model_loaded": true}`
3. **Frontend:** Open http://localhost:5173 - should show map interface

### Stopping the Servers

- Press `Ctrl+C` in each terminal window to stop

## 📝 License

This project is licensed under the MIT License.

## 👤 Contact

- **Project Lead:** Jude Joseph Garcia jr
- **Email:** judejosephgarciajr@gmail.com
- **GitHub Repository:** https://github.com/garcieee/Floodlert-2.0.git

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Description of changes"`
4. Push to the branch: `git push origin feature-name`
5. Create a pull request

## 🔮 Future Enhancements

- Integration with real-time NOAA weather APIs
- Historical flood data visualization
- Multi-model ensemble predictions
- Mobile application support
- Community-based flood reporting
- Alert system for high-risk areas
