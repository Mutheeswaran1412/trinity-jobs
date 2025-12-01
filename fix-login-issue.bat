@echo off
echo Fixing Login Issues...
echo =====================

REM Kill any existing processes on port 5000
echo 1. Killing existing backend processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

REM Wait for processes to close
timeout /t 3 /nobreak >nul

REM Start Node.js backend
echo 2. Starting Node.js Backend Server...
cd backend
start "Backend Server" cmd /k "echo Backend Server Starting... && node server.js"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Test the backend
echo 3. Testing backend connection...
cd ..
node test-employer-login.js

echo.
echo =====================
echo Backend should now be running on http://localhost:5000
echo Test the login at: http://localhost:5173
echo.
echo Working Employer Credentials:
echo Email: muthees@trinitetech.com
echo Password: 123456
echo.
pause