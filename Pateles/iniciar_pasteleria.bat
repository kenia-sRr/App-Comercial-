@echo off
title Servidor Local - Pasteleria AURA
color 0B
echo =======================================================
echo          PASTELERIA AURA - INICIANDO SERVIDOR
echo =======================================================
echo Iniciando servidor web local en Python...
echo Abriendo tu navegador en http://localhost:8000
echo.
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocurrio un error al ejecutar con python. Intentando con py...
    py server.py
)
pause
