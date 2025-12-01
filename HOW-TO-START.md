# ZyncJobs - How to Start Project

## Method 1: Easy Start (Recommended)
Double-click `start-project.bat` file

## Method 2: Manual Start
1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   npm run dev
   ```

## Login Credentials
- **Candidate:** test@example.com / 123456
- **Employer:** employer@example.com / 123456

## URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## Troubleshooting
If port 5000 is busy:
```bash
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

## Common Issues
1. **Backend not starting:** Run `npm install` in backend folder
2. **Login not working:** Make sure backend is running on port 5000
3. **Chatbot not working:** Backend must be running