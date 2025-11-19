import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

// Direct login/register routes for frontend compatibility
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple hardcoded users for testing
    const testUsers = [
      { email: 'test@example.com', password: '123456', name: 'Test User', userType: 'jobseeker' },
      { email: 'employer@example.com', password: '123456', name: 'Test Employer', userType: 'employer' }
    ];
    
    const user = testUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.json({
        message: 'Login successful',
        user: {
          id: '1',
          email: user.email,
          fullName: user.name,
          userType: user.userType
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;
    
    res.status(201).json({
      id: Date.now().toString(),
      message: 'Registration successful',
      userType: userType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat API endpoint with smart fallback responses
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message?.toLowerCase() || '';
    
    // Smart response system
    let response = getSmartResponse(userMessage);
    
    res.json({
      response: response,
      sources: []
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.json({
      response: "I'm here to help with jobs, careers, resumes, and interviews. What specific question do you have?",
      sources: []
    });
  }
});

// Smart response function
function getSmartResponse(message) {
  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! 👋 I'm ZyncJobs AI Assistant. I can help you with job searching, resume building, interview preparation, and career advice. What would you like to know?";
  }
  
  // Job search related
  if (message.includes('job') || message.includes('work') || message.includes('career')) {
    return "🔍 ZyncJobs has thousands of opportunities! I can help you:\n• Search for jobs by skills or location\n• Optimize your job applications\n• Understand job market trends\n• Prepare for interviews\n\nWhat specific help do you need?";
  }
  
  // Resume related
  if (message.includes('resume') || message.includes('cv')) {
    return "📄 I can help you create an amazing resume! Here's what I can do:\n• AI-powered resume generation\n• ATS optimization tips\n• Keyword suggestions\n• Format recommendations\n\nTry our AI Resume Builder or ask me specific questions!";
  }
  
  // Interview related
  if (message.includes('interview')) {
    return "🎯 Interview preparation is crucial! I can help with:\n• Common interview questions\n• STAR method responses\n• Technical interview prep\n• Salary negotiation tips\n\nWhat type of interview are you preparing for?";
  }
  
  // Skills related
  if (message.includes('skill') || message.includes('learn')) {
    return "🚀 Skills development is key to career growth! Popular in-demand skills:\n• AI/Machine Learning\n• Cloud Computing (AWS, Azure)\n• Full-Stack Development\n• Data Science\n• Cybersecurity\n\nWhich area interests you most?";
  }
  
  // Salary related
  if (message.includes('salary') || message.includes('pay')) {
    return "💰 Salary insights and negotiation tips:\n• Research market rates for your role\n• Use our salary report feature\n• Highlight your unique value\n• Practice negotiation scenarios\n\nWhat's your role or target position?";
  }
  
  // Company related
  if (message.includes('company') || message.includes('employer')) {
    return "🏢 Finding the right company is important! I can help you:\n• Research company culture\n• Understand hiring processes\n• Find company reviews\n• Connect with the right opportunities\n\nWhat type of company are you looking for?";
  }
  
  // Default response
  return "I'm your ZyncJobs AI Assistant! 🤖 I can help with:\n\n🔍 Job searching & applications\n📄 Resume writing & optimization\n🎯 Interview preparation\n💰 Salary negotiation\n🚀 Skills development\n🏢 Company research\n\nWhat would you like to explore today?";
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test MongoDB connection
app.get('/api/test', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 1) {
      res.json({ status: 'success', message: 'Connected to MongoDB Atlas' });
    } else {
      res.status(500).json({ status: 'error', message: 'Database not connected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});