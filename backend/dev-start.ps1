# ============================================================
# NexusHR Backend - PowerShell Dev Startup Script
# Usage: .\dev-start.ps1
#        .\dev-start.ps1 -Port 8082   (override port)
#        .\dev-start.ps1 -SkipClean   (skip mvn clean)
# ============================================================

param(
    [int]$Port = 8081,
    [switch]$SkipClean
)

$JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:JAVA_HOME = $JAVA_HOME
$env:PATH = "$JAVA_HOME\bin;" + $env:PATH

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NexusHR Backend Dev Startup" -ForegroundColor Cyan
Write-Host " Port: $Port  |  Java: $JAVA_HOME" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ── Step 1: Validate Java 17 ─────────────────────────────────
Write-Host "`n[1/4] Validating Java version..." -ForegroundColor Yellow
$javaVersion = & java -version 2>&1 | Select-String "version"
Write-Host "      $javaVersion" -ForegroundColor Gray
if ($javaVersion -notmatch '"17') {
    Write-Host "      WARNING: Expected Java 17. Spring Boot 3.3 requires Java 17+." -ForegroundColor Red
    Write-Host "      Set JAVA_HOME to JDK 17 path in this script." -ForegroundColor Red
}

# ── Step 2: Kill process on target port ──────────────────────
Write-Host "`n[2/4] Checking port $Port..." -ForegroundColor Yellow
$connections = netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING"
if ($connections) {
    $connections | ForEach-Object {
        $parts = $_ -split '\s+' | Where-Object { $_ -ne '' }
        $pid = $parts[-1]
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        Write-Host "      Killing PID $pid ($($proc.ProcessName)) on port $Port..." -ForegroundColor Red
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
    Write-Host "      Port $Port cleared." -ForegroundColor Green
} else {
    Write-Host "      Port $Port is free." -ForegroundColor Green
}

# ── Step 3: Kill all stale java.exe > 10 min idle ────────────
Write-Host "`n[3/4] Checking for stale Java processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CPU -lt 1 -and ((Get-Date) - $_.StartTime).TotalMinutes -gt 10
} | ForEach-Object {
    Write-Host "      Killing stale java.exe PID $($_.Id) (started $($_.StartTime))" -ForegroundColor DarkYellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "      Done." -ForegroundColor Green

# ── Step 4: Maven clean + run ────────────────────────────────
Write-Host "`n[4/4] Starting Spring Boot..." -ForegroundColor Yellow

if (-not $SkipClean) {
    Write-Host "      Running mvn clean..." -ForegroundColor Gray
    & mvn clean -q
}

Write-Host "      Launching on http://localhost:$Port/api" -ForegroundColor Cyan
Write-Host "      Swagger: http://localhost:$Port/api/swagger-ui.html`n" -ForegroundColor Cyan

$env:PORT = $Port
& mvn spring-boot:run `
    "-Dspring-boot.run.profiles=dev" `
    "-Dspring-boot.run.jvmArguments=-Xms256m -Xmx512m -XX:+UseG1GC"
