const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with consistent secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');

      // Get user from the token
      if (global.demoUsers) {
        // Demo mode - find user in demo users
        req.user = global.demoUsers.find(u => u._id === decoded.id);
      } else {
        // Regular MongoDB mode
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      if (req.user.isActive === false) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user account is deactivated'
        });
      }

      next();
    } catch (error) {
      logger.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, user not found'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user has specific permission
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, user not found'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `User does not have permission: ${permission}`
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
      
      if (global.demoUsers) {
        // Demo mode - find user in demo users
        req.user = global.demoUsers.find(u => u._id === decoded.id);
      } else {
        // Regular MongoDB mode
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Don't fail, just continue without user
      logger.warn('Optional auth failed:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  hasPermission,
  optionalAuth
};
