@echo off
echo Deleting sample/test jobs from database...
echo.
cd backend
node scripts/deleteSampleJobs.js
echo.
echo Done!
pause
