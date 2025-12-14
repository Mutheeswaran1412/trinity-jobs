@echo off
echo.
echo ========================================
echo   Quick Fix - Applications Not Showing
echo ========================================
echo.

echo Testing API...
curl http://localhost:5000/api/applications

echo.
echo.
echo If you see applications above, the issue is email mismatch.
echo.
echo Fix:
echo 1. Press F12 in browser
echo 2. Go to Console tab
echo 3. Type: localStorage.clear()
echo 4. Logout and login again
echo.
pause
