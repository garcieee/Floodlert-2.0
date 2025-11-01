# 🌊 Installing ANUGA for FloodLert AI

ANUGA (Australian National University Geodynamics) is a physics-based shallow water equation simulator specifically designed for flood and tsunami modeling.

## 📦 Installation Methods

### **Method 1: Conda (Recommended) ✅**

```bash
# Add conda-forge channel
conda config --add channels conda-forge
conda config --set channel_priority strict

# Install ANUGA
conda install anuga
```

### **Method 2: From Source (Development)**

If you want the latest version or need to customize:

```bash
# Clone the repository
git clone https://github.com/anuga-community/anuga_core.git
cd anuga_core

# Install in development mode
pip install -e .
```

## ✅ Verify Installation

```python
python -c "import anuga; print('ANUGA version:', anuga.__version__)"
```

## 🚀 Using with FloodLert AI

Once installed, your FloodLert AI app will automatically use ANUGA for physics-based flood simulations!

**No additional configuration needed** - the code detects ANUGA and uses it automatically.

## 📚 Resources

- **GitHub:** https://github.com/anuga-community/anuga_core
- **Documentation:** https://anuga.readthedocs.io/
- **Website:** http://anuga.anu.edu.au

## 💡 Why ANUGA?

✅ **Physics-based** - Uses actual shallow water equations
✅ **No training needed** - Works with terrain + precipitation directly
✅ **Interpretable** - Results based on physical laws, not black-box ML
✅ **Designed for floods** - Specifically built for flood/tsunami simulation
✅ **Well-tested** - Used by Geoscience Australia and researchers worldwide

## 🔄 Fallback Behavior

If ANUGA is not installed:
- App automatically falls back to U-Net model (if available)
- Or uses simplified flood estimation
- No errors - graceful degradation!

