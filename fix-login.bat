@echo off
echo Fixing login issue...

REM Kill all processes on port 5000
echo Stopping all processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

REM Kill Python processes
taskkill /f /im python.exe 2>nul

echo Starting Node.js server...
cd backend
node server.js