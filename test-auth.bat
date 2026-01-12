@echo off
echo ========================================
echo Trinity Jobs - Auth Workflow Test
echo ========================================
echo.
echo Starting authentication workflow test...
echo.

cd backend
node test_auth_workflow.js

echo.
echo ========================================
echo Test completed!
echo ========================================
pause
