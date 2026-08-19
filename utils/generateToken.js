import { SignJWT } from 'jose';
import { JWT_SECRET } from './getJwtSecret.js';

/**
 * Generates a JSON Web Token (JWT)
 * @param {Object} payload - Data to embed in token (e.g., userId)
 * @param {string} expiresIn - Expiration time string (default: '15m')
 */
export const generateToken = async (payload, expiresIn = '15m') => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};