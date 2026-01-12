@echo off
echo ========================================
echo   Fixing Application Data Migration
echo ========================================
echo.

cd backend
node scripts/fixApplications.js

echo.
echo ========================================
echo   Migration Complete!
echo ========================================
pause
