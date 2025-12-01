@echo off
echo Starting Backend Server...

REM Kill any existing processes on port 5000
echo Killing existing backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

REM Wait for processes to close
timeout /t 2 /nobreak >nul

REM Start Node.js backend
echo Starting Node.js Backend Server...
cd backend
node server.js

pause