@echo off
cd /d "%~dp0backend"
echo Installing backend dependencies...
python -m pip install -r requirements.txt
echo.
echo Starting backend server on http://localhost:8000
python -m uvicorn main:socket_app --port 8000 --reload
pause
