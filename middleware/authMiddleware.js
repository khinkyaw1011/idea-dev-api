import { jwtVerify } from 'jose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { JWT_SECRET } from '../utils/getJwtSecret.js';

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Authorization header starting with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Extract token string
    const token = authHeader.split(' ')[1];

    // Verify token and extract payload
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Fetch user and attach selected fields to request object
    const user = await User.findById(payload.userId).select('_id name email');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401);
    next(error);
  }
};