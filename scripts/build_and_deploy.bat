@echo off
setlocal
set WORKTREE=C:\TEMP\RIG Financeiro
set DESTINO=F:\RIG Financeiro

echo === RIG Financeiro 2.0 - Build e Deploy ===
echo Origem: %WORKTREE%
echo Destino: %DESTINO%

echo.
echo [1/4] Build do frontend...
cd /d "%WORKTREE%\frontend"
call npm.cmd run build
if errorlevel 1 (echo ERRO no build && exit /b 1)

echo.
echo [2/4] Copiando frontend/dist...
if not exist "%DESTINO%\frontend\dist" mkdir "%DESTINO%\frontend\dist"
xcopy /E /Y /I /Q dist "%DESTINO%\frontend\dist"

echo.
echo [3/4] Copiando backend (sem cache)...
cd /d "%WORKTREE%"
if not exist "%DESTINO%\backend" mkdir "%DESTINO%\backend"
xcopy /E /Y /I /Q /EXCLUDE:scripts\xcopy_exclude.txt "%WORKTREE%\backend" "%DESTINO%\backend"

echo.
echo [4/4] Copiando arquivos de configuracao...
xcopy /Y /Q "%WORKTREE%\.env" "%DESTINO%\"
if not exist "%DESTINO%\infra" mkdir "%DESTINO%\infra"
xcopy /Y /Q "%WORKTREE%\infra\docker-compose.yml" "%DESTINO%\infra\"
if not exist "%DESTINO%\scripts" mkdir "%DESTINO%\scripts"
xcopy /E /Y /I /Q "%WORKTREE%\scripts" "%DESTINO%\scripts"

echo.
echo === Deploy concluido em %DESTINO% ===
endlocal
