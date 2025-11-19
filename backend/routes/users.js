import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

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

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

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

    res.json({ 
      message: 'Login successful',
      user: userResponse 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;