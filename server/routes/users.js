const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Regulator)
router.get('/', protect, authorize('admin', 'regulator'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isString().withMessage('Role must be a string'),
  query('organization').optional().isString().withMessage('Organization must be a string')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.organization) {
      filter.organization = new RegExp(req.query.organization, 'i');
    }

    const users = await User.find(filter)
      .select('-password -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: users
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has permission to view this user
    if (req.user.userId !== req.params.userId && 
        !['admin', 'regulator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:userId
// @access  Private (Admin or own profile)
router.put('/:userId', protect, [
  body('username').optional().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('role').optional().isIn(['farmer', 'processor', 'laboratory', 'regulator', 'retailer', 'consumer', 'admin']).withMessage('Invalid role'),
  body('organization').optional().isLength({ max: 100 }).withMessage('Organization name cannot be more than 100 characters')
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

    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has permission to update this user
    if (req.user.userId !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    // Only admin can change role and permissions
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admin can change user role'
      });
    }

    if (req.body.permissions && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admin can change user permissions'
      });
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    ).select('-password -loginAttempts -lockUntil');

    logger.info(`User updated: ${req.params.userId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Deactivate user
// @route   PUT /api/users/:userId/deactivate
// @access  Private (Admin only)
router.put('/:userId/deactivate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'User is already deactivated'
      });
    }

    user.isActive = false;
    await user.save();

    logger.info(`User deactivated: ${req.params.userId} by ${req.user.userId}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Activate user
// @route   PUT /api/users/:userId/activate
// @access  Private (Admin only)
router.put('/:userId/activate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'User is already active'
      });
    }

    user.isActive = true;
    await user.save();

    logger.info(`User activated: ${req.params.userId} by ${req.user.userId}`);

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    logger.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, Regulator)
router.get('/stats', protect, authorize('admin', 'regulator'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);

    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const organizationStats = await User.aggregate([
      {
        $group: {
          _id: '$organization',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 10 }
    ]);

    const monthlyStats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0
        },
        roleBreakdown: roleStats,
        organizationBreakdown: organizationStats,
        monthlyGrowth: monthlyStats
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
