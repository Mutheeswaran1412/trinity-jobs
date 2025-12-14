@echo off
echo.
echo ========================================
echo   Installing Real-time Features
echo ========================================
echo.

echo [1] Installing Socket.io in backend...
cd backend
call npm install socket.io@^4.7.2
echo.

echo [2] Installing Socket.io client in frontend...
cd ..
call npm install socket.io-client@^4.7.2
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart backend: cd backend ^&^& npm start
echo 2. Restart frontend: npm run dev
echo.
pause
