import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '../utils/getJwtSecret.js';
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    // Validation: Check required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user (Password hashing is handled automatically in pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
    });

    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, '15m');
    const refreshToken = await generateToken(payload, '30d');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' :'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Return created user (excluding password and metadata)
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear refresh token cookie
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});
// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Validate request body
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Return generic error if user does not exist (prevents email enumeration)
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Create payload and generate tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, '1m');
    const refreshToken = await generateToken(payload, '30d');

    // Set refresh token in HTTP-only cookie
     res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' :'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Send response
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// @route   POST /api/auth/refresh
// @desc    Generate new access token from refresh token
// @access  Public (Requires valid refresh token in cookie)
router.post('/refresh', async (req, res, next) => {
  try {
    // Extract token from HTTP-only cookie using cookie-parser
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error('No refresh token');
    }

    // Verify token & extract payload
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Find user using payload ID
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error('No user');
    }

    // Generate new short-lived access token (1 minute)
    const accessToken = await generateToken({ userId: user._id.toString() }, '1m');

    // Respond with new access token and user info
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401);
    next(error);
  }
});

export default router;