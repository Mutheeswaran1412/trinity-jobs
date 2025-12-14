import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import connectDB from './config/database.js';
import jobRoutes from './routes/jobs.js';
import userRoutes from './routes/users.js';
import applicationRoutes from './routes/applications.js';
import moderationRoutes from './routes/moderation.js';
import resumeBasicRoutes from './routes/resumeBasic.js';
import adminJobsRoutes from './routes/adminJobs.js';
import testMistralRoutes from './routes/testMistral.js';
import companyRoutes from './routes/companies.js';
import companySearchRoutes from './routes/companySearch.js';
import pdfRoutes from './routes/pdf.js';
import resumeVersionRoutes from './routes/resumeVersions.js';
import aiSuggestionsRoutes from './routes/aiSuggestions.js';
import suggestRoutes from './routes/suggestRoutes.js';
import adminUserRoutes from './routes/adminUsers.js';
import adminAnalyticsRoutes from './routes/adminAnalytics.js';
import adminSettingsRoutes from './routes/adminSettings.js';
import adminBulkRoutes from './routes/adminBulk.js';
import adminAuditRoutes from './routes/adminAudit.js';
import aiScoringRoutes from './routes/aiScoring.js';
import aiScoringFlowRoutes from './routes/aiScoringFlow.js';
import employerCandidatesRoutes from './routes/employerCandidates.js';
import adminSystemRoutes from './routes/adminSystem.js';
import adminNotificationRoutes from './routes/adminNotifications.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';
import profileRoutes from './routes/profile.js';
import autocompleteRoutes from './routes/autocomplete.js';
import companyAutocompleteRoutes from './routes/companyAutocomplete.js';
import linkedinParserRoutes from './routes/linkedinParser.js';
import Notification from './models/Notification.js';
import Message from './models/Message.js';

import { generateAccessToken, generateRefreshToken } from './utils/jwt.js';
import { errorHandler, notFound } from './utils/errorHandler.js';
import { validateEnv } from './utils/envValidator.js';


dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

connectDB();

// Socket.io connection
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;
      const conversationId = [senderId, receiverId].sort().join('_');
      
      const newMessage = new Message({
        conversationId,
        senderId,
        receiverId,
        message
      });
      await newMessage.save();
      
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', newMessage);
      }
      socket.emit('message_sent', newMessage);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Helper to send notification
export async function sendNotification(userId, type, title, message, link = null) {
  try {
    const notification = new Notification({ userId, type, title, message, link });
    await notification.save();
    
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
    }
    return notification;
  } catch (error) {
    console.error('Notification error:', error);
  }
}

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
app.use('/api/applications', applicationRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin/jobs', adminJobsRoutes);
app.use('/api/test', testMistralRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/company', companySearchRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/resume-versions', resumeVersionRoutes);
app.use('/api/ai-suggestions', aiSuggestionsRoutes);
app.use('/api', suggestRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/bulk', adminBulkRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/ai', aiScoringRoutes);
app.use('/api/ai-flow', aiScoringFlowRoutes);
app.use('/api/employer', employerCandidatesRoutes);
app.use('/api/admin/system', adminSystemRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/resume', resumeBasicRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/api/companies', companyAutocompleteRoutes);
app.use('/api', linkedinParserRoutes);

// Resume parser with AI
app.post('/api/resume-parser/parse', async (req, res) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No PDF data provided' });
    }

    console.log('🔍 Processing resume...');
    
    // Convert base64 to buffer and extract text
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    const pdfTextExtractor = (await import('./services/pdfTextExtractor.js')).default;
    const resumeText = await pdfTextExtractor.extractTextFromBuffer(pdfBuffer);
    
    console.log('📄 Extracted text length:', resumeText.length);
    
    if (!resumeText.trim()) {
      return res.status(400).json({ success: false, error: 'Could not extract text from PDF' });
    }
    
    // Use the AI parser to extract structured data
    const { resumeParser } = await import('./utils/resumeParserAI.js');
    const profileData = await resumeParser.parseResumeToProfile(resumeText);
    
    // Convert to the expected format
    const parsedData = {
      personalInfo: {
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || ''
      },
      summary: profileData.summary || '',
      skills: profileData.skills || [],
      experience: profileData.workExperience ? [{
        title: profileData.title || '',
        company: 'Previous Company',
        duration: profileData.experience ? `${profileData.experience} years` : '',
        description: profileData.workExperience,
        current: false
      }] : [],
      education: profileData.education ? [{
        degree: profileData.education,
        institution: 'University/College',
        duration: ''
      }] : [],
      projects: [],
      certifications: profileData.certifications || [],
      languages: ['English']
    };
    
    console.log('✅ Resume parsing completed!');
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('❌ Parse error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Password reset functionality
const resetTokens = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.post('/api/forgot-password', (req, res) => {
  console.log('Forgot password request received:', req.body);
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  console.log('Processing reset for email:', email);
  
  try {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = Date.now() + 3600000;
    
    resetTokens.set(resetToken, { email, expiry: resetExpiry });
    console.log('Token generated and stored');
    
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log('Reset link:', resetLink);
    
    // Try to send email but don't fail if it doesn't work
    const mailOptions = {
      from: `"ZyncJobs" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'ZyncJobs - Password Reset Request',
      text: `
ZyncJobs - Password Reset Request

Hello,

We received a request to reset your password for your ZyncJobs account.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

ZyncJobs Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 32px;">ZyncJobs</h1>
  </div>
  
  <div style="background-color: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0;">Password Reset Request</h2>
    
    <p style="color: #333; margin: 0 0 15px 0;">Hello,</p>
    
    <p style="color: #333; margin: 0 0 15px 0;">We received a request to reset your password for your ZyncJobs account.</p>
    
    <p style="color: #333; margin: 0 0 30px 0;">Click the button below to reset your password:</p>
    
    <div style="margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
    </div>
    
    <p style="color: #333; margin: 30px 0 10px 0;">Or copy and paste this link in your browser:</p>
    
    <p style="color: #6366f1; margin: 0 0 30px 0; word-break: break-all;">${resetLink}</p>
    
    <p style="color: #666; margin: 0;">This link will expire in 1 hour for security reasons.</p>
    
    <p style="color: #666; margin: 15px 0 0 0;">If you didn't request this password reset, please ignore this email.</p>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
    <p style="color: #666; margin: 0; font-size: 12px;">ZyncJobs Team</p>
  </div>
</div>
      `
    };
    
    transporter.sendMail(mailOptions)
      .then(() => console.log('Email sent successfully!'))
      .catch(err => console.log('Email failed:', err.message));
    
    // Always return success immediately
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ message: 'Email sent' });
  }
});

app.get('/api/verify-reset-token/:token', (req, res) => {
  const { token } = req.params;
  const tokenData = resetTokens.get(token);
  
  if (!tokenData || Date.now() > tokenData.expiry) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  res.json({ valid: true, email: tokenData.email });
});

app.post('/api/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and password required' });
  }
  
  const tokenData = resetTokens.get(token);
  if (!tokenData || Date.now() > tokenData.expiry) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  resetTokens.delete(token);
  console.log('Password reset successful for:', tokenData.email);
  
  res.json({ success: true, message: 'Password reset successful' });
});

app.get('/api/test-suggest', (req, res) => {
  res.json({ message: 'Suggest API is working', timestamp: new Date().toISOString() });
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = null;
    
    if (email === 'mutheeswaran1424@gmail.com' && password === '123456') {
      user = { id: '1', email: email, name: 'Mutheeswaran', fullName: 'Mutheeswaran', userType: 'candidate' };
    } else if (email === 'test@candidate.com' && password === '123456') {
      user = { id: '2', email: email, fullName: 'Test Candidate', userType: 'candidate' };
    } else if (email === 'test@employer.com' && password === '123456') {
      user = { id: '3', email: email, fullName: 'Test Employer', userType: 'employer' };
    } else if (email === 'employer@test.com' && password === '123456') {
      user = { id: '4', email: email, fullName: 'Employer User', userType: 'employer' };
    } else if (email === 'hr@company.com' && password === '123456') {
      user = { id: '5', email: email, fullName: 'HR Manager', userType: 'employer' };
    } else if (email === 'admin@trinity.com' && password === '123456') {
      user = { id: '6', email: email, fullName: 'Trinity Admin', userType: 'admin' };
    } else if (email === 'muthees@trinitetech.com' && password === '123456') {
      user = { id: '7', email: email, fullName: 'Muthees Trinity', companyName: 'Trinity Technology Solutions', userType: 'employer' };
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

app.post('/api/generate-content', async (req, res) => {
  try {
    const { type, jobTitle, company, degree, school } = req.body;
    let content = '';
    
    if (type === 'experience') {
      content = `• Managed daily operations and improved efficiency by implementing new processes\n• Collaborated with cross-functional teams to deliver high-quality results\n• Analyzed data and provided insights to support strategic decision-making`;
    } else if (type === 'education') {
      content = `Graduated with ${degree || 'Bachelor\'s degree'} from ${school || 'University'}. Completed coursework in relevant subjects and developed strong analytical skills.`;
    } else if (type === 'summary') {
      content = `Dedicated ${jobTitle || 'professional'} with strong background and proven track record of delivering results.`;
    }
    
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test resume parser route
app.get('/api/resume-parser/test', (req, res) => {
  res.json({ message: 'Resume parser route is working!', timestamp: new Date().toISOString() });
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

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`💬 Socket.io enabled for real-time features`);
});