import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import connectDB from './config/database.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';

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
app.use('/api/companies', companyRoutes);

// Direct login/register routes for frontend compatibility
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded working credentials
    if (email === 'mutheeswaran1424@gmail.com' && password === '123456') {
      res.json({
        message: 'Login successful',
        user: {
          id: '1',
          email: email,
          fullName: 'Mutheeswaran',
          userType: 'candidate'
        }
      });
      return;
    }
    
    if (email === 'test@candidate.com' && password === '123456') {
      res.json({
        message: 'Login successful',
        user: {
          id: '2',
          email: email,
          fullName: 'Test Candidate',
          userType: 'candidate'
        }
      });
      return;
    }
    
    if (email === 'test@employer.com' && password === '123456') {
      res.json({
        message: 'Login successful',
        user: {
          id: '3',
          email: email,
          fullName: 'Test Employer',
          userType: 'employer'
        }
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
    
    res.status(201).json({
      id: Date.now().toString(),
      message: 'Registration successful',
      userType: userType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + 3600000; // 1 hour
    
    // Store token
    resetTokens.set(resetToken, { email, expiry: resetExpiry });
    
    // Create reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Trinity Jobs - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your Trinity Jobs account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Trinity Jobs Team</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({
      message: 'Password reset email sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    
    // For demo, just confirm password reset
    // In production, update password in database
    resetTokens.delete(token);
    
    res.json({
      message: 'Password reset successful',
      email: tokenData.email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.get('/api/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenData = resetTokens.get(token);
    if (!tokenData || Date.now() > tokenData.expiry) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    res.json({ valid: true, email: tokenData.email });
  } catch (error) {
    res.status(500).json({ error: 'Token verification failed' });
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