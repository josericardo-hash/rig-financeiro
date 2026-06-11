@echo off
title RIG Financeiro 2.0
color 0A
cls

echo.
echo  =====================================================
echo   RIG Financeiro 2.0 - Grupo Performa Extreme
echo  =====================================================
echo.

echo [1/4] Verificando PostgreSQL...
docker ps --filter "name=rig_postgres" --format "{{.Status}}" 2^>nul | find "Up" ^>nul
if errorlevel 1 (
    echo       Subindo PostgreSQL...
    cd /d "F:\RIG Financeiro\infra"
    docker compose up -d postgres pgadmin
    timeout /t 12 /nobreak ^>nul
) else (
    echo       PostgreSQL OK
)

echo.
echo [2/4] Iniciando Backend API porta 8055...
start "RIG Backend" cmd /k "color 0B && title RIG Backend && cd /d F:\RIG Financeiro\backend && C:\Users\jose.goncalves\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn main:app --reload --port 8055"
timeout /t 6 /nobreak ^>nul

echo.
echo [3/4] Iniciando Frontend React porta 5173...
start "RIG Frontend" cmd /k "color 0D && title RIG Frontend && cd /d C:\TEMP\rig-financeiro-build\frontend && npm.cmd run dev -- --port 5173 --host 127.0.0.1"
timeout /t 8 /nobreak ^>nul

echo.
echo [4/4] Abrindo navegador...
start "" "http://127.0.0.1:5173/dashboard"

cls
echo.
echo  =====================================================
echo   RIG Financeiro 2.0 - SISTEMA NO AR
echo  =====================================================
echo.
echo   Sistema:    http://127.0.0.1:5173
echo   API Docs:   http://localhost:8055/docs
echo   pgAdmin:    http://localhost:5050
echo.
echo   TELAS DISPONIVEIS:
echo   /dashboard           Dashboard Executivo
echo   /financeiro-avancado DRE e Liquidez
echo   /contas-receber      Aging + Pagamentos
echo   /contas-pagar        Estrutura de Despesas
echo   /fluxo-caixa         Realizado vs Previsto
echo   /comercial           Produtos e B2B/B2C
echo   /mapa-vendas         Mapa Brasil drill-down
echo   /vendas              Pedidos com itens
echo   /clientes-crm        Base de clientes
echo   /campanhas           Segmentacao
echo   /forecast            Projecao 3 meses
echo   /configuracoes       Conta Azul OAuth
echo.
echo   Para parar: execute PARAR_RIG.bat
echo  =====================================================
echo.
pause
