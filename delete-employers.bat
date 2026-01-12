@echo off
echo ========================================
echo  DELETE EMPLOYER ACCOUNTS
echo ========================================
echo.
echo WARNING: This will delete ALL employer accounts!
echo.
set /p confirm="Are you sure? Type 'YES' to confirm: "

if /i "%confirm%"=="YES" (
    echo.
    echo Deleting employer accounts...
    cd backend
    node delete_employers.js
    cd ..
) else (
    echo.
    echo Operation cancelled.
)

echo.
pause
