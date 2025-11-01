@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting FloodLert AI Backend Server...
echo Server will run on http://localhost:8000
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

