@echo off
echo Starting ZyncJobs Project...

REM Kill any existing processes on port 5000
echo Killing existing backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

REM Start backend
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Server...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause