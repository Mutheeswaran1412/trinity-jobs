@echo off
echo ========================================
echo  Remove Employee Credentials from DB
echo ========================================
echo.
echo WARNING: This will remove all passwords and tokens from the database!
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "

if /i "%confirm%" NEQ "yes" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Removing employee credentials...
cd backend\scripts
node removeEmployeeCredentials.js
cd ..\..

echo.
echo Done!
pause
