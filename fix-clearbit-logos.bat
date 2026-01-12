@echo off
echo ========================================
echo    Fix Clearbit Logo URLs Migration
echo ========================================
echo.
echo This script will:
echo - Find all jobs and companies with Clearbit URLs
echo - Replace them with img.logo.dev URLs
echo - Fix tracking prevention errors
echo.
echo Make sure your backend server is NOT running before proceeding.
echo.
pause

cd backend
echo Running migration script...
node scripts/fixClearbitLogos.js

echo.
echo Migration completed!
echo You can now restart your backend server.
pause