@echo off
chcp 65001
cd /d "%~dp0"
echo ========================================================
echo   Exam Paper Generator - Local Launch Script
echo ========================================================
echo.
echo Starting Browser...
start "" "http://localhost:5176"
echo.
echo Starting Development Server...
echo (Press Ctrl+C to stop the server)
echo.
npm run dev
pause
