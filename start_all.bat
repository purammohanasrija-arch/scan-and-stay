@echo off
title Scan and Stay - System Launcher
echo ========================================================
echo Launching Scan ^& Stay Full-Stack Platform...
echo ========================================================
start "Scan & Stay - Backend API" cmd /c "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "Scan & Stay - Frontend Web App" cmd /c "%~dp0start_frontend.bat"
echo.
echo Both servers are starting up!
echo - Backend API:   http://localhost:8000/docs
echo - Frontend App:  http://localhost:5173
echo.
