@echo off
title Mindful Garden
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "node_modules\vite\bin\vite.js" (
  echo.
  echo [Mindful Garden] Project dependencies were not found.
  echo Open a terminal here, run: npm install
  echo Then double-click this launcher again.
  echo.
  pause
  exit /b 1
)

if not "%NODE_EXE%"=="node" if not exist "%NODE_EXE%" (
  echo.
  echo [Mindful Garden] Node.js was not found.
  echo Install Node.js 20 or newer, then try again.
  echo.
  pause
  exit /b 1
)

echo Waking up the garden...
start "Open Mindful Garden" cmd.exe /c "ping 127.0.0.1 -n 3 ^>nul ^& start ^"^" http://127.0.0.1:4173"
echo Keep this window open while using Mindful Garden.
echo Press Ctrl+C or close this window to stop the local server.
echo.
"%NODE_EXE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 4173 --strictPort
