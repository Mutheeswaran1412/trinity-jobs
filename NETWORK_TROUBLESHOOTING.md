# Network Error Troubleshooting Guide

## Current Status ✅
- **Backend Server**: Running on http://localhost:5000
- **Frontend Server**: Running on http://localhost:5173  
- **API Endpoints**: Working correctly
- **Database**: Connected to MongoDB Atlas

## Quick Fixes

### 1. Clear Browser Cache
```bash
# Press Ctrl+Shift+R to hard refresh
# Or clear browser cache and cookies
```

### 2. Restart Both Servers
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Backend
cd backend
python run.py

# Frontend (new terminal)
npm run dev
```

### 3. Check CORS Settings
The backend has CORS enabled for `http://localhost:5173`. If you're accessing from a different URL, update the CORS settings.

### 4. Test API Directly
```bash
# Test login
curl -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@candidate.com\",\"password\":\"123456\"}" http://localhost:5000/api/login

# Test jobs
curl http://localhost:5000/api/jobs
```

## Working Test Credentials
- **Email**: test@candidate.com
- **Password**: 123456
- **User Type**: Candidate

- **Email**: test@employer.com  
- **Password**: 123456
- **User Type**: Employer

## Common Issues & Solutions

### Network Error in Browser
1. **Check Console**: Open browser DevTools (F12) → Console tab
2. **Check Network Tab**: Look for failed requests
3. **Disable Extensions**: Try in incognito mode
4. **Firewall**: Ensure ports 5000 and 5173 are not blocked

### API Not Responding
1. **Backend Running**: Check if `python run.py` is active
2. **Port Conflicts**: Ensure no other apps use port 5000
3. **Environment Variables**: Check `.env` file in backend folder

### Database Connection Issues
1. **MongoDB Atlas**: Check connection string in `.env`
2. **Network**: Ensure internet connection for Atlas
3. **Credentials**: Verify database password

## Test Commands
```bash
# Test backend health
curl http://localhost:5000/api/test

# Test frontend access
curl http://localhost:5173

# Check running processes
netstat -an | findstr :5000
netstat -an | findstr :5173
```

## If Still Having Issues
1. Check browser console for specific error messages
2. Look at backend terminal for error logs
3. Try accessing http://localhost:5000/api/test directly in browser
4. Restart your computer if all else fails

## Contact Support
If the issue persists, provide:
- Browser console error messages
- Backend terminal logs
- Operating system details
- Steps that led to the error