@echo off
echo 🔄 Restarting Backend with Resume Parser Fixes...

cd backend

echo 📦 Installing dependencies...
npm install

echo 🚀 Starting server...
node server.js

pause