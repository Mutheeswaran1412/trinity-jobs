# Single Vercel Deployment Guide

## இப்போ ஒரே deployment-ல frontend + backend deploy ஆகும்

### Steps:

1. **Root folder-ல இருந்து deploy பண்ணுங்க:**
   ```bash
   vercel --prod
   ```

2. **Environment variables set பண்ணுங்க Vercel dashboard-ல:**
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `NODE_ENV=production`

3. **API calls இப்போ same domain-ல work ஆகும்:**
   - Frontend: `https://your-app.vercel.app`
   - Backend API: `https://your-app.vercel.app/api/*`

### Configuration Changes Made:
- ✅ `vercel.json` - Both frontend & backend builds
- ✅ API routes `/api/*` → backend
- ✅ All other routes → frontend
- ✅ Production API URL = same domain

### Test After Deployment:
- `https://your-app.vercel.app/api/test`
- `https://your-app.vercel.app/api/jobs`

இப்போ single command-ல full app deploy ஆகும்! 🚀