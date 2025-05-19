const jwt = require('jsonwebtoken');
const Log = require('../models/Log');
const dotenv = require('dotenv');

// It's good practice to ensure dotenv is configured in middleware if they rely on env vars directly
dotenv.config();

const authMiddleware = async (req, res, next) => {
  // Log the JWT secret being used for verification
  console.log('Backend authMiddleware: JWT_SECRET being used for verification:', process.env.JWT_SECRET);

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.warn('Backend authMiddleware: Authentication failed - No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Backend authMiddleware: Token verified successfully for user:', decoded.id);
    next();
  } catch (err) {
    // Log the specific token verification error
    console.error('Backend authMiddleware: Token verification failed:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user) {
     console.warn('Backend roleMiddleware: Role check failed - User not authenticated');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    console.warn(`Backend roleMiddleware: Access denied for user ${req.user.id}: insufficient role (${req.user.role})`);
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

const logAction = async (userId, action, details) => {
  try {
    const log = new Log({ user: userId, action, details });
    await log.save();
  } catch (err) {
    console.error('Error logging action:', err);
  }
};

module.exports = { authMiddleware, roleMiddleware, logAction };