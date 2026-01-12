import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many accounts created. Please try again after an hour.',
});

// POST /api/users/register - Register new user
router.post('/register', registerLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, fullName, email, password, userType, phone, company, companyName, companyLogo, companyWebsite, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user - support both name and fullName
    const userName = name || fullName || '';
    const companyField = company || companyName || '';
    
    const user = new User({
      name: userName,
      email,
      password: hashedPassword,
      userType: userType || 'candidate',
      phone: phone || '',
      company: companyField,
      companyLogo: companyLogo || '',
      companyWebsite: companyWebsite || '',
      location: location || ''
    });

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, userName, userType || 'candidate');
    } catch (emailError) {
      console.log('Welcome email failed:', emailError.message);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      company: user.company,
      companyLogo: user.companyLogo,
      companyWebsite: user.companyWebsite,
      location: user.location
    };

    res.status(201).json({ 
      message: 'User registered successfully',
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Welcome email function
async function sendWelcomeEmail(email, name, userType) {
  try {
    const nodemailer = await import('nodemailer');
    
    console.log('📧 Sending welcome email to:', email);
    console.log('SMTP Config:', {
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_EMAIL
    });
    
    const transporter = nodemailer.default.createTransport({
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

    const subject = 'Welcome to ZyncJobs! 🎉';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to ZyncJobs!</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello ${name || 'there'}! 👋</h2>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for joining ZyncJobs! We're excited to have you as part of our community.
        </p>
        
        ${userType === 'employer' ? `
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          As an employer, you can now:
        </p>
        <ul style="color: #333; font-size: 16px; line-height: 1.8;">
          <li>Post unlimited job openings</li>
          <li>Search and connect with top candidates</li>
          <li>Manage applications efficiently</li>
          <li>Build your company profile</li>
        </ul>
        ` : `
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          As a job seeker, you can now:
        </p>
        <ul style="color: #333; font-size: 16px; line-height: 1.8;">
          <li>Browse thousands of job opportunities</li>
          <li>Apply to jobs with one click</li>
          <li>Build your professional profile</li>
          <li>Get AI-powered job recommendations</li>
        </ul>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
      
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
        <p style="color: #666; margin: 0; font-size: 12px;">© 2025 ZyncJobs. All rights reserved.</p>
      </div>
    </div>
  `;

    const info = await transporter.sendMail({
      from: `"ZyncJobs" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      html
    });
    
    console.log('✅ Welcome email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// POST /api/users/login - Login user
router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Contact support.' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended. Contact support.' });
    }
    if (user.status === 'deleted') {
      return res.status(403).json({ error: 'Account has been deleted.' });
    }

    // Load profile data from Profile collection
    let profileData = {};
    try {
      const mongoose = await import('mongoose');
      const Profile = mongoose.default.model('Profile');
      const profile = await Profile.findOne({ 
        $or: [{ userId: user._id }, { email: user.email }] 
      });
      if (profile) {
        profileData = {
          profilePhoto: profile.profilePhoto,
          profileFrame: profile.profileFrame,
          coverPhoto: profile.coverPhoto,
          skills: profile.skills,
          title: profile.title,
          location: profile.location
        };
      }
    } catch (err) {
      console.log('Profile load error:', err.message);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const decoded = verifyToken(refreshToken);

    // Clean old expired refresh tokens
    user.refreshTokens = user.refreshTokens.filter(rt => 
      rt.expiresAt > new Date() && rt.isActive
    );

    // Add new refresh token to database
    user.refreshTokens.push({
      token: refreshToken,
      tokenId: decoded.tokenId.toString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });

    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      company: user.company,
      companyLogo: user.companyLogo,
      companyWebsite: user.companyWebsite,
      location: user.location,
      ...profileData
    };

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      message: 'Login successful',
      user: userResponse,
      accessToken,
      refreshToken // Also send in response for flexibility
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/status - Update user status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:id/save-job - Save a job for user
router.post('/:id/save-job', async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.userType !== 'candidate') {
      return res.status(400).json({ error: 'Only candidates can save jobs' });
    }
    
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }
    
    res.json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id/save-job/:jobId - Remove saved job
router.delete('/:id/save-job/:jobId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== req.params.jobId);
    await user.save();
    
    res.json({ message: 'Job removed from saved jobs', savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id/saved-jobs - Get user's saved jobs
router.get('/:id/saved-jobs', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('savedJobs');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/refresh - Refresh access token with rotation
router.post('/refresh', async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyToken(oldRefreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Find the refresh token in database
    const tokenRecord = user.refreshTokens.find(rt => 
      rt.token === oldRefreshToken && rt.isActive && rt.expiresAt > new Date()
    );

    if (!tokenRecord) {
      // Token reuse detected - block all tokens for this user
      user.refreshTokens.forEach(rt => rt.isActive = false);
      await user.save();
      return res.status(403).json({ error: 'Token reuse detected. Please login again.' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    const newDecoded = verifyToken(newRefreshToken);

    // Block old refresh token
    tokenRecord.isActive = false;

    // Add new refresh token
    user.refreshTokens.push({
      token: newRefreshToken,
      tokenId: newDecoded.tokenId.toString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });

    // Clean old expired tokens
    user.refreshTokens = user.refreshTokens.filter(rt => 
      rt.expiresAt > new Date() || rt.isActive
    );

    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/users/logout - Logout user and invalidate all tokens
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const { logoutAll } = req.body; // Option to logout from all devices

    if (refreshToken) {
      const decoded = verifyToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        if (logoutAll) {
          // Logout from all devices
          user.refreshTokens.forEach(rt => rt.isActive = false);
        } else {
          // Logout from current device only
          const tokenRecord = user.refreshTokens.find(rt => rt.token === refreshToken);
          if (tokenRecord) {
            tokenRecord.isActive = false;
          }
        }
        await user.save();
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/sessions - Get active sessions (optional security feature)
router.get('/sessions', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeSessions = user.refreshTokens
      .filter(rt => rt.isActive && rt.expiresAt > new Date())
      .map(rt => ({
        tokenId: rt.tokenId,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
        isCurrent: rt.token === refreshToken
      }));

    res.json({ sessions: activeSessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/sessions/:tokenId - Revoke specific session
router.delete('/sessions/:tokenId', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { tokenId } = req.params;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tokenRecord = user.refreshTokens.find(rt => rt.tokenId === tokenId);
    if (tokenRecord) {
      tokenRecord.isActive = false;
      await user.save();
    }

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;