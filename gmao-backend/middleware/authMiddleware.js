const jwt = require('jsonwebtoken');
const Log = require('../models/Log');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const roleMiddleware = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
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