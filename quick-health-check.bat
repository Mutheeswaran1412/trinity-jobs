@echo off
echo.
echo ========================================
echo   ZyncJobs Health Check
echo ========================================
echo.

echo [1] Checking Backend Server...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Backend Server: Running
) else (
    echo [FAIL] Backend Server: Not Running
    echo        Start with: cd backend ^&^& npm start
)

echo.
echo [2] Checking Database Connection...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] MongoDB Atlas: Connected
) else (
    echo [FAIL] MongoDB Atlas: Not Connected
)

echo.
echo [3] Checking Jobs API...
curl -s http://localhost:5000/api/jobs >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Jobs API: Working
) else (
    echo [FAIL] Jobs API: Not Working
)

echo.
echo [4] Checking Users API...
curl -s http://localhost:5000/api/users >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Users API: Working
) else (
    echo [FAIL] Users API: Not Working
)

echo.
echo [5] Checking Companies API...
curl -s http://localhost:5000/api/companies >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Companies API: Working
) else (
    echo [FAIL] Companies API: Not Working
)

echo.
echo [6] Checking Resume Parser...
curl -s http://localhost:5000/api/resume-parser/test >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Resume Parser: Working
) else (
    echo [FAIL] Resume Parser: Not Working
)

echo.
echo [7] Checking Frontend Server...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Frontend: Running
) else (
    echo [FAIL] Frontend: Not Running
    echo        Start with: npm run dev
)

echo.
echo ========================================
echo   Health Check Complete
echo ========================================
echo.
pause
