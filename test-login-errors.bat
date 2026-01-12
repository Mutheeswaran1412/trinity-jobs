@echo off
echo ========================================
echo Testing Login Error Messages
echo ========================================
echo.
echo Make sure backend is running first!
echo.
pause
echo.
echo Running tests...
echo.

cd backend
node test_login_errors.js

echo.
echo ========================================
echo Test completed!
echo ========================================
pause
