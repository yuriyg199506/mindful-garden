@echo off
setlocal
title Mindful Garden Launcher
cd /d "%~dp0"

echo ========================================
echo          MINDFUL GARDEN
echo ========================================
echo.

if not exist "node_modules\vite\bin\vite.js" goto MISSING_DEPS

where node.exe >nul 2>nul
if not errorlevel 1 set "NODE_EXE=node.exe"

if not defined NODE_EXE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not defined NODE_EXE goto MISSING_NODE

echo Starting local server at http://127.0.0.1:4173
echo Please keep this window open.
echo.

start "Open Mindful Garden" cmd.exe /c "ping 127.0.0.1 -n 3 ^>nul ^& start ^"^" http://127.0.0.1:4173"
"%NODE_EXE%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --port 4173 --strictPort

echo.
echo The server has stopped or failed to start.
echo Read the message above, then press any key to close.
pause >nul
exit /b 0

:MISSING_DEPS
echo ERROR: Project dependencies are missing.
echo.
echo Open a terminal in this folder and run:
echo     npm install
echo.
pause
exit /b 1

:MISSING_NODE
echo ERROR: Node.js was not found.
echo.
echo Install Node.js 20 or newer from https://nodejs.org/
echo Then double-click START_GARDEN.bat again.
echo.
pause
exit /b 1
