import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import companySearchRoutes from './routes/companySearch.js';
import pdfRoutes from './routes/pdf.js';
import resumeVersionRoutes from './routes/resumeVersions.js';
import aiSuggestionsRoutes from './routes/aiSuggestions.js';
import suggestRoutes from './routes/suggestRoutes.js';
import { generateAccessToken, generateRefreshToken } from './utils/jwt.js';
import { errorHandler, notFound } from './utils/errorHandler.js';
import { validateEnv } from './utils/envValidator.js';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company', companySearchRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/resume-versions', resumeVersionRoutes);
app.use('/api/ai-suggestions', aiSuggestionsRoutes);
app.use('/api', suggestRoutes);

app.get('/api/test-suggest', (req, res) => {
  res.json({ message: 'Suggest API is working', timestamp: new Date().toISOString() });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = null;
    
    if (email === 'mutheeswaran1424@gmail.com' && password === '123456') {
      user = { id: '1', email: email, fullName: 'Mutheeswaran', userType: 'candidate' };
    } else if (email === 'test@candidate.com' && password === '123456') {
      user = { id: '2', email: email, fullName: 'Test Candidate', userType: 'candidate' };
    } else if (email === 'test@employer.com' && password === '123456') {
      user = { id: '3', email: email, fullName: 'Test Employer', userType: 'employer' };
    } else if (email === 'employer@test.com' && password === '123456') {
      user = { id: '4', email: email, fullName: 'Employer User', userType: 'employer' };
    } else if (email === 'hr@company.com' && password === '123456') {
      user = { id: '5', email: email, fullName: 'HR Manager', userType: 'employer' };
    } else if (email === 'admin@trinity.com' && password === '123456') {
      user = { id: '6', email: email, fullName: 'Trinity Admin', userType: 'employer' };
    } else if (email === 'muthees@trinitetech.com' && password === '123456') {
      user = { id: '7', email: email, fullName: 'Muthees Trinity', userType: 'employer' };
    }
    
    if (user) {
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json({
        message: 'Login successful',
        user: user,
        accessToken
      });
      return;
    }
    
    res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;
    const userId = Date.now().toString();
    
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      id: userId,
      message: 'Registration successful',
      userType: userType,
      accessToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message?.toLowerCase() || '';
    
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

function getSmartResponse(message) {
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! 👋 I'm ZyncJobs AI Assistant. I can help you with job searching, resume building, interview preparation, and career advice. What would you like to know?";
  }
  
  if (message.includes('job') || message.includes('work') || message.includes('career')) {
    return "🔍 ZyncJobs has thousands of opportunities! I can help you:\n• Search for jobs by skills or location\n• Optimize your job applications\n• Understand job market trends\n• Prepare for interviews\n\nWhat specific help do you need?";
  }
  
  if (message.includes('resume') || message.includes('cv')) {
    return "📄 I can help you create an amazing resume! Here's what I can do:\n• AI-powered resume generation\n• ATS optimization tips\n• Keyword suggestions\n• Format recommendations\n\nTry our AI Resume Builder or ask me specific questions!";
  }
  
  if (message.includes('interview')) {
    return "🎯 Interview preparation is crucial! I can help with:\n• Common interview questions\n• STAR method responses\n• Technical interview prep\n• Salary negotiation tips\n\nWhat type of interview are you preparing for?";
  }
  
  if (message.includes('skill') || message.includes('learn')) {
    return "🚀 Skills development is key to career growth! Popular in-demand skills:\n• AI/Machine Learning\n• Cloud Computing (AWS, Azure)\n• Full-Stack Development\n• Data Science\n• Cybersecurity\n\nWhich area interests you most?";
  }
  
  if (message.includes('salary') || message.includes('pay')) {
    return "💰 Salary insights and negotiation tips:\n• Research market rates for your role\n• Use our salary report feature\n• Highlight your unique value\n• Practice negotiation scenarios\n\nWhat's your role or target position?";
  }
  
  if (message.includes('company') || message.includes('employer')) {
    return "🏢 Finding the right company is important! I can help you:\n• Research company culture\n• Understand hiring processes\n• Find company reviews\n• Connect with the right opportunities\n\nWhat type of company are you looking for?";
  }
  
  return "I'm your ZyncJobs AI Assistant! 🤖 I can help with:\n\n🔍 Job searching & applications\n📄 Resume writing & optimization\n🎯 Interview preparation\n💰 Salary negotiation\n🚀 Skills development\n🏢 Company research\n\nWhat would you like to explore today?";
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

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

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});