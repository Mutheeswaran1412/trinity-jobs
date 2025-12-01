@echo off
echo Setting up Resume Parser with sample data...

cd backend

echo Installing dependencies...
npm install

echo Adding sample jobs to database...
node add_sample_jobs.js

echo Testing resume parser...
node test_resume_parser.js

echo Setup complete! Resume parser is ready to use.
pause