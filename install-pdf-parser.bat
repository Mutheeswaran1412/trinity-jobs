@echo off
echo Installing PDF parser dependencies...
cd backend
npm install pdf-parse
echo PDF parser installed successfully!
echo.
echo Starting backend server...
npm start
pause