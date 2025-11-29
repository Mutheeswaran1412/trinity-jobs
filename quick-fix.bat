@echo off
echo 🔧 Quick Fix - Restarting Backend...
cd backend
taskkill /f /im python.exe 2>nul
timeout /t 2 /nobreak >nul
start "Backend Fixed" cmd /k "python run.py"
echo ✅ Backend restarted with fixes!
echo 📱 Backend: http://localhost:5000
echo 🔑 Test login: test@candidate.com / 123456
pause