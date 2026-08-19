import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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
      sameSite: 'none',
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

export default router;