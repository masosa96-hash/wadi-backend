@echo off
title WADI - Launcher
cd /d "%~dp0"

echo ================================
echo   Iniciando WADI...
echo ================================

:: Levantar backend
start "WADI API" powershell -NoExit -Command "cd 'E:\WADI intento mil'; pnpm dev:api"

timeout /t 2 >nul

:: Levantar frontend
start "WADI FRONTEND" powershell -NoExit -Command "cd 'E:\WADI intento mil'; pnpm dev:front"

echo.
echo Todo listo. Abriendo navegador...
timeout /t 2 >nul

start "" http://localhost:5173
exit
