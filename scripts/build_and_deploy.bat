@echo off
setlocal
set FRONTEND=F:\RIG Financeiro\frontend
set STAGING=C:\TEMP\rig-financeiro-build\frontend

echo === RIG Financeiro 2.0 - Build ===
echo Origem: %FRONTEND%
echo Staging: %STAGING%

if not exist "C:\TEMP\rig-financeiro-build" mkdir "C:\TEMP\rig-financeiro-build"
if not exist "%STAGING%" mkdir "%STAGING%"

robocopy "%FRONTEND%" "%STAGING%" /E /XD node_modules dist .vite /XF *.log
if errorlevel 8 exit /b 1

cd /d "%STAGING%"
call npm.cmd install
if errorlevel 1 exit /b 1

call npm.cmd run build
if errorlevel 1 exit /b 1

if not exist "%FRONTEND%\dist" mkdir "%FRONTEND%\dist"
robocopy "%STAGING%\dist" "%FRONTEND%\dist" /MIR
if errorlevel 8 exit /b 1

echo === Build concluido ===
echo Acesse: http://localhost:5173
endlocal
