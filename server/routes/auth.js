const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['farmer', 'processor', 'laboratory', 'regulator', 'retailer', 'consumer', 'admin']).withMessage('Invalid role'),
  body('organization').notEmpty().withMessage('Organization is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, username, email, password, role, organization, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ userId }, { username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this ID, username, or email'
      });
    }

    // Set default permissions based on role
    const rolePermissions = {
      farmer: ['create_batch', 'add_harvest_event'],
      processor: ['add_processing_event', 'add_quality_test'],
      laboratory: ['add_lab_test', 'upload_certificate'],
      regulator: ['view_all', 'audit', 'compliance_check'],
      retailer: ['add_retail_event', 'scan_qr'],
      consumer: ['scan_qr'],
      admin: ['view_all', 'audit', 'compliance_check', 'generate_qr']
    };

    // Create user
    const user = await User.create({
      userId,
      username,
      email,
      password,
      role,
      organization,
      permissions: rolePermissions[role] || [],
      profile: profile || {}
    });

    // Generate JWT token
    const token = user.getSignedJwtToken();

    logger.info(`User registered: ${userId} (${role})`);

    res.status(201).json({
      success: true,
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('identifier').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body;

    // Check if we're in demo mode (no MongoDB)
    if (global.demoUsers) {
      // Find user in demo users
      const user = global.demoUsers.find(u => 
        u.username === identifier || u.email === identifier
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Simple password check for demo (password123)
      if (password !== 'password123') {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate JWT token with consistent secret
      const token = jwt.sign(
        { id: user._id, userId: user.userId, role: user.role },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      logger.info(`Demo user logged in: ${user.username} (${user.role})`);

      return res.json({
        success: true,
        token,
        user: userResponse
      });
    }

    // Regular MongoDB authentication
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    logger.info(`User logged in: ${user.userId}`);

    res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // req.user should already contain the user data from the protect middleware
      if (!req.user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Remove password from response
      const userResponse = { ...req.user };
      delete userResponse.password;

      return res.json({
        success: true,
        user: userResponse
      });
    }

    // Regular MongoDB authentication
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions,
        profile: user.profile,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('profile.firstName').optional().isLength({ max: 50 }).withMessage('First name cannot be more than 50 characters'),
  body('profile.lastName').optional().isLength({ max: 50 }).withMessage('Last name cannot be more than 50 characters'),
  body('profile.phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please add a valid phone number'),
  body('profile.bio').optional().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { profile, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profile: { ...req.user.profile, ...profile },
        preferences: { ...req.user.preferences, ...preferences }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.userId}`);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    logger.info(`User logged out: ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
