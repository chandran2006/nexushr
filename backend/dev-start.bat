@echo off
setlocal

set PORT=8081
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

echo ============================================================
echo  NexusHR Backend - Dev Startup
echo  Port: %PORT%  Java: %JAVA_HOME%
echo ============================================================

:: ── Step 1: Kill any process holding the port ────────────────
echo.
echo [1/4] Checking port %PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    echo       Found PID %%a on port %PORT% - terminating...
    taskkill /PID %%a /F >nul 2>&1
    echo       PID %%a terminated.
)
echo       Port %PORT% is clear.

:: ── Step 2: Kill any leftover Maven daemon ───────────────────
echo.
echo [2/4] Cleaning Maven daemon processes...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq mvnd.exe" /FO CSV ^| findstr "mvnd"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo       Done.

:: ── Step 3: Clean target ─────────────────────────────────────
echo.
echo [3/4] Running mvn clean...
call mvn clean -q
echo       Clean complete.

:: ── Step 4: Start Spring Boot ────────────────────────────────
echo.
echo [4/4] Starting Spring Boot (profile=dev)...
echo       URL: http://localhost:%PORT%/api
echo       Swagger: http://localhost:%PORT%/api/swagger-ui.html
echo.
call mvn spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.jvmArguments="-Xms256m -Xmx512m"

endlocal
