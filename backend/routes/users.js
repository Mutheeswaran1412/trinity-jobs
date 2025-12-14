import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();

// POST /api/users/register - Register new user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['candidate', 'employer']).withMessage('User type must be candidate or employer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, userType, phone, company, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // In production, hash this password
      userType,
      phone,
      company,
      location
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
      location: user.location,
      createdAt: user.createdAt
    };

    res.status(201).json({ 
      message: 'User registered successfully',
      user: userResponse 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/login - Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Hardcoded test user
    if (email === 'mutheeswaran1424@gmail.com' && password === '123456') {
      const testUser = {
        _id: 'test-user-123',
        name: 'Mutheeswaran',
        email: email,
        userType: 'candidate',
        phone: '9876543210',
        location: 'Chennai',
        refreshTokens: []
      };
      
      const accessToken = generateAccessToken(testUser._id);
      const refreshToken = generateRefreshToken(testUser._id);
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      return res.json({ 
        message: 'Login successful',
        user: {
          id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          userType: testUser.userType,
          phone: testUser.phone,
          location: testUser.location
        },
        accessToken,
        refreshToken
      });
    }

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended. Contact support.' });
    }
    if (user.status === 'deleted') {
      return res.status(403).json({ error: 'Account has been deleted.' });
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
      location: user.location
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