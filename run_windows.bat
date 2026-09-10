@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js 20+ and run this file again.
  pause
  exit /b 1
)
if not exist "backend\node_modules" (
  echo Installing backend dependencies...
  call npm install --prefix backend
  if errorlevel 1 exit /b 1
)
echo Starting SIH ETA Forecast...
call npm start
pause
