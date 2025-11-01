# API & Services Requirements

## ✅ **REQUIRED (App Won't Work Without This)**

### 1. **Map Library** ✅ **USING MAPLIBRE (NO API KEY NEEDED)**
- **What:** MapLibre GL - Open source map library
- **Cost:** 100% FREE - No API key, no credit card, no account
- **How it works:** Uses free OpenStreetMap tiles
- **Setup:** Nothing needed - just install dependencies!
- **Status:** ✅ Already configured - no setup required

---

## ⚠️ **OPTIONAL (App Works with Synthetic Data)**

The app currently uses **synthetic/fake data** for demonstration. You can run it and test without these, but for **real predictions** you need:

### 2. **Weather API** (Optional - For Real Weather Data)
- **Current status:** Using synthetic random precipitation data
- **What you need:** NOAA GFS API or similar weather service
- **Where to get:**
  - **NOAA GFS (Free):** https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast
  - **OpenWeatherMap API:** https://openweathermap.org/api (has free tier)
  - **Weather.gov API:** Free, no key needed
  
- **How to integrate:**
  - Modify `backend/app/api/v1/endpoints/predict.py`
  - Replace the `fetch_weather_data()` function
  - Add API URL/key to `backend/.env`:
    ```
    WEATHER_API_URL=https://api.openweathermap.org/data/2.5
    WEATHER_API_KEY=your_key_here
    ```

### 3. **ANUGA Simulator** ✅ **PRIMARY METHOD (RECOMMENDED)**
- **Current status:** ✅ Integrated - Physics-based flood simulation
- **What:** ANUGA (Australian National University Geodynamics) - Shallow water equation simulator
- **Features:**
  - ✅ Physics-based (no training required)
  - ✅ Interpretable results
  - ✅ Specifically designed for floods/tsunamis
  - ✅ Uses terrain + precipitation for realistic simulation
- **Installation:**
  ```bash
  conda install -c conda-forge anuga
  ```
- **More info:** https://github.com/anuga-community/anuga_core
- **Status:** ✅ Code integrated - just install ANUGA!
- **What happens without it:** Falls back to U-Net model or simplified estimation

### 4. **Trained PyTorch Model** (Optional - Fallback)
- **Current status:** Used as fallback if ANUGA not available
- **What you need:** A trained U-Net model file
- **How to get:** Train your own model or use a pre-trained one
- **File location:** `backend/data/flood_model.pth`
- **What happens without it:** Uses untrained model (predictions won't be accurate) or simplified estimation

### 5. **Terrain Data File** (Optional)
- **Current status:** Using synthetic terrain data
- **What you need:** GeoTIFF file with elevation data
- **Where to get:**
  - **SRTM Data:** https://earthexplorer.usgs.gov/ (free)
  - **ASTER GDEM:** https://earthexplorer.usgs.gov/ (free)
  - **OpenDEM:** https://www.opendem.info/ (free)
- **File location:** `backend/data/terrain_data.tif`
- **What happens without it:** App generates random terrain data

---

## 📊 **Summary**

| Service/API | Required? | Status | Where to Get |
|------------|-----------|--------|--------------|
| **Map Library** | ✅ **DONE** | Using MapLibre (free) | No setup needed! |
| **Weather API** | ✅ **DONE** | Open-Meteo integrated | No API key needed! |
| **ANUGA Simulator** | ✅ **DONE** | Code integrated | Install: `conda install anuga` |
| **Trained Model** | ⚠️ Optional | Fallback method | Train yourself or find pre-trained |
| **Terrain Data** | ⚠️ Optional | Synthetic data works | USGS EarthExplorer (free) |

---

## 🚀 **To Get Started RIGHT NOW:**

**Minimum required:**
1. ✅ Nothing! No API keys needed
2. Run backend → Uses synthetic data (works immediately)
3. Run frontend → Map will display automatically

**That's it!** The app works completely free with no setup.

---

## 📝 **For Production Use:**

To get **real flood predictions**, you need:
1. ✅ MapLibre (already free - no changes needed)
2. ✅ Weather API (Open-Meteo already integrated)
3. ✅ ANUGA simulator (code ready, just install: `conda install anuga`)
4. ⚠️ Terrain elevation data (optional - improves accuracy)

---

## 🔗 **Free API Resources**

### Weather APIs (Free):
- **NOAA GFS:** https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast
- **OpenWeatherMap:** https://openweathermap.org/api (free tier: 60 calls/min)
- **Weather.gov:** https://www.weather.gov/documentation/services-web-api (free, no key)

### Terrain Data (Free):
- **USGS EarthExplorer:** https://earthexplorer.usgs.gov/
  - Search for "SRTM" or "ASTER GDEM"
  - Download as GeoTIFF
- **OpenDEM:** https://www.opendem.info/

---

## 💡 **Quick Test Setup**

**Just want to test the app?** You need:
```
✅ NOTHING! Just run it - completely free!
✅ No API keys
✅ No credit cards
✅ No accounts
```

The synthetic data lets you:
- ✅ Test the full UI
- ✅ See how predictions work
- ✅ Test the map interface
- ⚠️ Predictions won't be accurate (using random data)

