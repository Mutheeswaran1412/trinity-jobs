# Vercel Deployment Fix Instructions

## Current Issues:
1. Backend API not accessible (ERR_CONNECTION_REFUSED)
2. Manifest.json 401/404 errors
3. Frontend trying to connect to localhost in production

## Solution Steps:

### Step 1: Deploy Backend Separately
1. Create a new Vercel project for backend:
   ```bash
   cd backend
   vercel --prod
   ```
2. Set environment variables in Vercel dashboard:
   - MONGODB_URI
   - JWT_SECRET
   - NODE_ENV=production

### Step 2: Update Frontend Environment
1. Update `.env.production` with your backend URL:
   ```
   VITE_API_URL=https://your-backend-deployment-url.vercel.app
   ```

### Step 3: Redeploy Frontend
1. Build and deploy frontend:
   ```bash
   npm run build
   vercel --prod
   ```

### Step 4: Test API Endpoints
Test these endpoints after deployment:
- GET /api/test - MongoDB connection
- GET /api/jobs - Job listings
- POST /api/users - User registration

## Backend Deployment URL Format:
Your backend should be deployed to something like:
`https://trinity-jobs-backend-[random].vercel.app`

## Frontend Environment Variables:
Make sure these are set in Vercel dashboard:
- VITE_API_URL=https://your-backend-url.vercel.app
- VITE_APP_NAME=ZyncJobs
- VITE_APP_VERSION=1.0.0

## Common Issues:
1. **CORS**: Make sure backend allows your frontend domain
2. **Environment Variables**: Set in Vercel dashboard, not just .env files
3. **Build Errors**: Check Vercel build logs for specific errors
4. **API Routes**: Ensure all API routes are properly configured

## Testing:
After deployment, test:
1. Frontend loads without errors
2. API calls work (check Network tab)
3. Database connections are successful
4. User registration/login works