@echo off
title Parando RIG Financeiro...
color 0C
echo Encerrando RIG Financeiro 2.0...
taskkill /FI "WINDOWTITLE eq RIG Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq RIG Frontend*" /F >nul 2>&1
echo Processos encerrados.
timeout /t 2 /nobreak >nul
