@echo off
echo 🔄 Restarting Trinity Jobs Servers...
echo.

echo 📱 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python run.py"

echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo 📱 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul