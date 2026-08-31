@echo off
title Scan and Stay - Frontend (Vite React)
echo ========================================================
echo Starting Scan ^& Stay Frontend on port 5173...
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
