# Job Portal Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your MongoDB Atlas credentials:
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/jobportal?retryWrites=true&w=majority&appName=JobPortal
```

### 3. Test Database Connection
```bash
npm run test
```

### 4. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Frontend Setup

### 1. Install Dependencies
```bash
# From project root
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs (with pagination)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `GET /api/jobs/search/query` - Search jobs

### System
- `GET /api/health` - Health check
- `GET /api/test` - Test MongoDB connection

## MongoDB Atlas Setup

1. **Create Cluster**: Set up a new cluster in MongoDB Atlas
2. **Database User**: Create user with read/write permissions
3. **Network Access**: Whitelist your IP address (or use 0.0.0.0/0 for development)
4. **Connection String**: Copy connection string and update .env file

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_NAME=jobportal
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Connection Issues
- Verify MongoDB Atlas credentials
- Check IP whitelist in Network Access
- Ensure cluster is running

### CORS Issues
- Check FRONTEND_URL in backend .env
- Verify API_URL in frontend .env

### Port Conflicts
- Change PORT in backend .env
- Update VITE_API_URL in frontend .env