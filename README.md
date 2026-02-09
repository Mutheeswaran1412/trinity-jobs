# Job Portal with PostgreSQL & Local Development

## Local Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (local installation)

### Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure PostgreSQL:**
   - Update `backend/.env` with your PostgreSQL connection details
   - Create database using: `npm run create:db`

3. **Start both frontend and backend:**
   ```bash
   npm run start:all
   ```
   - Backend will run on `http://localhost:5000`
   - Frontend will run on `http://localhost:5173`

### Alternative: Run Separately

**Backend only:**
```bash
npm run start:backend
```

**Frontend only:**
```bash
npm run start:frontend
```

### API Endpoints

- `GET /api/test` - Test PostgreSQL connection
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/<id>` - Get specific job
- `GET /api/search?q=<query>&location=<location>` - Search jobs
- `POST /api/users` - Create new user
- `GET /api/users/<id>` - Get specific user

### Database Tables

Your PostgreSQL database will have:
- `jobs` - Job listings
- `users` - User profiles
- `applications` - Job applications
- `analytics` - User analytics

### Environment Configuration

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

**Backend (backend/.env):**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyncjobs
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/zyncjobs
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Important Notes

1. Make sure PostgreSQL is installed and running
2. Update your PostgreSQL credentials in `backend/.env`
3. Frontend runs on port 5173 (Vite default)
4. Backend runs on port 5000
5. CORS is configured for local development
6. No Docker or ECS deployment needed - runs locally