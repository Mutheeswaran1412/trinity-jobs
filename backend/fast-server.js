import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import passport from './config/passport.js';
import session from 'express-session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Minimal middleware for fast startup
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Essential routes only
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fast server running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'ZyncJobs Fast Server', status: 'OK' });
});

// Connect DB and start server
connectDB().then(() => {
  console.log('✅ Database connected');
  
  app.listen(PORT, () => {
    console.log(`🚀 Fast server running on port ${PORT}`);
    console.log(`⚡ Startup time: ${process.uptime().toFixed(2)}s`);
    console.log(`🔗 Test: http://localhost:${PORT}/api/health`);
  });
}).catch(error => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});

export default app;