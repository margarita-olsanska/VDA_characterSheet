@echo off
rem no install needed - server.ps1 only uses what Windows/PowerShell already ships with
start "VTM Character Sheet Server" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0server.ps1"

timeout /t 1 /nobreak >nul
start http://localhost:5500/char-sheet.html
