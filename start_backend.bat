@echo off
title Scan and Stay - Backend (FastAPI)
echo ========================================================
echo Starting Scan ^& Stay FastAPI Backend on port 8000...
echo ========================================================
cd /d "%~dp0backend"
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
