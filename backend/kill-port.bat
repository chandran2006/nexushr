@echo off
:: Usage: kill-port.bat 8081
:: Kills whatever process is holding the given port.

set PORT=%1
if "%PORT%"=="" set PORT=8081

echo Scanning port %PORT%...

set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    set FOUND=1
    echo Found PID %%a on port %PORT%
    tasklist /FI "PID eq %%a" /FO TABLE /NH
    taskkill /PID %%a /F
)

if %FOUND%==0 (
    echo Port %PORT% is not in use.
)
