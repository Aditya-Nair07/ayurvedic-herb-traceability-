const express = require('express');
const { body, validationResult, query } = require('express-validator');
const HerbBatch = require('../models/HerbBatch');
const { protect, authorize, hasPermission } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Create a new herb batch
// @route   POST /api/batches
// @access  Private (Farmers)
router.post('/', protect, authorize('farmer'), [
  body('batchId').notEmpty().withMessage('Batch ID is required'),
  body('species').notEmpty().withMessage('Species is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').isIn(['kg', 'g', 'lb', 'oz', 'tons', 'pieces']).withMessage('Invalid unit'),
  body('latitude').isNumeric().withMessage('Latitude must be a number'),
  body('longitude').isNumeric().withMessage('Longitude must be a number'),
  body('address').notEmpty().withMessage('Address is required')
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

    const {
      batchId,
      species,
      quantity,
      unit,
      latitude,
      longitude,
      address,
      metadata
    } = req.body;

    // Check if batch already exists
    const existingBatch = await HerbBatch.findOne({ batchId });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID already exists'
      });
    }

    // Create batch data for blockchain
    const batchData = {
      batchId,
      species,
      farmerId: req.user.userId,
      quantity: parseFloat(quantity),
      unit,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address
    };

    // Create batch on blockchain
    let blockchainResult;
    try {
      blockchainResult = await blockchainService.createHerbBatch(batchData);
    } catch (blockchainError) {
      logger.error('Blockchain error during batch creation:', blockchainError);
      return res.status(503).json({
        success: false,
        error: 'Blockchain service unavailable'
      });
    }

    // Create batch in database
    const herbBatch = await HerbBatch.create({
      batchId,
      species,
      harvestDate: new Date(),
      harvestLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      },
      farmerId: req.user.userId,
      quantity: parseFloat(quantity),
      unit,
      status: 'harvested',
      events: [{
        eventId: `event_${batchId}_${Date.now()}`,
        eventType: 'harvest',
        timestamp: new Date(),
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address
        },
        actorId: req.user.userId,
        actorRole: req.user.role,
        description: `Harvested ${quantity} ${unit} of ${species}`,
        compliance: {
          passed: true,
          checkedAt: new Date(),
          checkedBy: 'system'
        }
      }],
      complianceStatus: {
        geoFencing: true,
        seasonal: true,
        quality: true,
        species: true,
        overall: true,
        lastChecked: new Date(),
        violations: []
      },
      metadata: metadata || {}
    });

    logger.info(`Herb batch created: ${batchId} by ${req.user.userId}`);

    res.status(201).json({
      success: true,
      data: herbBatch
    });
  } catch (error) {
    logger.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all herb batches
// @route   GET /api/batches
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('species').optional().isString().withMessage('Species must be a string'),
  query('status').optional().isString().withMessage('Status must be a string'),
  query('farmerId').optional().isString().withMessage('Farmer ID must be a string')
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

    // Check if we're in demo mode
    if (global.demoUsers) {
      // Return demo data
      const demoBatches = [
        {
          _id: 'demo_batch_001',
          batchId: 'BATCH001',
          species: 'Ashwagandha',
          harvestDate: new Date('2024-01-15'),
          harvestLocation: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka, India'
          },
          farmerId: 'farmer001',
          quantity: 100,
          unit: 'kg',
          status: 'harvested',
          events: [{
            eventId: 'event_001',
            eventType: 'harvest',
            timestamp: new Date('2024-01-15'),
            location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka, India' },
            actorId: 'farmer001',
            actorRole: 'farmer',
            description: 'Harvested 100 kg of Ashwagandha',
            compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
          }],
          complianceStatus: {
            geoFencing: true,
            seasonal: true,
            quality: true,
            species: true,
            overall: true,
            lastChecked: new Date(),
            violations: []
          },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: 'demo_batch_002',
          batchId: 'BATCH002',
          species: 'Turmeric',
          harvestDate: new Date('2024-01-20'),
          harvestLocation: {
            latitude: 19.0760,
            longitude: 72.8777,
            address: 'Mumbai, Maharashtra, India'
          },
          farmerId: 'farmer001',
          quantity: 150,
          unit: 'kg',
          status: 'processed',
          events: [
            {
              eventId: 'event_002',
              eventType: 'harvest',
              timestamp: new Date('2024-01-20'),
              location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra, India' },
              actorId: 'farmer001',
              actorRole: 'farmer',
              description: 'Harvested 150 kg of Turmeric',
              compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
            },
            {
              eventId: 'event_003',
              eventType: 'processing',
              timestamp: new Date('2024-01-22'),
              location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Processing Plant' },
              actorId: 'processor001',
              actorRole: 'processor',
              description: 'Processed and dried turmeric',
              compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
            }
          ],
          complianceStatus: {
            geoFencing: true,
            seasonal: true,
            quality: true,
            species: true,
            overall: true,
            lastChecked: new Date(),
            violations: []
          },
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-22')
        }
      ];

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Apply filters
      let filteredBatches = demoBatches;
      
      if (req.query.species) {
        filteredBatches = filteredBatches.filter(batch => 
          batch.species.toLowerCase().includes(req.query.species.toLowerCase())
        );
      }
      
      if (req.query.status) {
        filteredBatches = filteredBatches.filter(batch => batch.status === req.query.status);
      }
      
      if (req.query.farmerId) {
        filteredBatches = filteredBatches.filter(batch => batch.farmerId === req.query.farmerId);
      }

      // If user is not admin or regulator, only show their own batches
      if (!['admin', 'regulator'].includes(req.user.role)) {
        filteredBatches = filteredBatches.filter(batch => batch.farmerId === req.user.userId);
      }

      const total = filteredBatches.length;
      const paginatedBatches = filteredBatches.slice(skip, skip + limit);

      return res.json({
        success: true,
        count: paginatedBatches.length,
        total,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          limit
        },
        data: paginatedBatches
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.species) {
      filter.species = new RegExp(req.query.species, 'i');
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.farmerId) {
      filter.farmerId = req.query.farmerId;
    }

    // If user is not admin or regulator, only show their own batches
    if (!['admin', 'regulator'].includes(req.user.role)) {
      filter.farmerId = req.user.userId;
    }

    // Skip MongoDB operations in demo mode - already handled above
    const batches = await HerbBatch.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('farmerId', 'userId username organization');

    const total = await HerbBatch.countDocuments(filter);

    res.json({
      success: true,
      count: batches.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: batches
    });
  } catch (error) {
    logger.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Search batches
// @route   GET /api/batches/search
// @access  Private
router.get('/search', protect, [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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
    const searchQuery = req.query.q;

    // Build search filter
    const filter = {
      $text: { $search: searchQuery }
    };

    // If user is not admin or regulator, only search their own batches
    if (!['admin', 'regulator'].includes(req.user.role)) {
      filter.farmerId = req.user.userId;
    }

    const batches = await HerbBatch.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('farmerId', 'userId username organization');

    const total = await HerbBatch.countDocuments(filter);

    res.json({
      success: true,
      count: batches.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: batches
    });
  } catch (error) {
    logger.error('Search batches error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get batch statistics
// @route   GET /api/batches/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // Return demo stats
      const demoStats = {
        overview: {
          totalBatches: 2,
          totalQuantity: 250,
          avgQuantity: 125,
          uniqueSpecies: 2
        },
        statusBreakdown: [
          { _id: 'harvested', count: 1 },
          { _id: 'processed', count: 1 }
        ],
        complianceBreakdown: [
          { _id: true, count: 2 }
        ]
      };

      return res.json({
        success: true,
        data: demoStats
      });
    }

    // Build filter based on user role
    const matchFilter = {};
    if (!['admin', 'regulator'].includes(req.user.role)) {
      matchFilter.farmerId = req.user.userId;
    }

    const stats = await HerbBatch.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalBatches: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' },
          speciesCount: { $addToSet: '$species' }
        }
      },
      {
        $project: {
          _id: 0,
          totalBatches: 1,
          totalQuantity: 1,
          avgQuantity: { $round: ['$avgQuantity', 2] },
          uniqueSpecies: { $size: '$speciesCount' }
        }
      }
    ]);

    const statusStats = await HerbBatch.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const complianceStats = await HerbBatch.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$complianceStatus.overall',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalBatches: 0,
          totalQuantity: 0,
          avgQuantity: 0,
          uniqueSpecies: 0
        },
        statusBreakdown: statusStats,
        complianceBreakdown: complianceStats
      }
    });
  } catch (error) {
    logger.error('Get batch stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single herb batch
// @route   GET /api/batches/:batchId
// @access  Private
router.get('/:batchId', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // Return demo data
      const demoBatches = [
        {
          _id: 'demo_batch_001',
          batchId: 'BATCH001',
          species: 'Ashwagandha',
          harvestDate: new Date('2024-01-15'),
          harvestLocation: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka, India'
          },
          farmerId: {
            _id: 'demo_farmer_001',
            userId: 'farmer001',
            username: 'john_farmer',
            organization: 'Green Valley Farms',
            profile: {}
          },
          quantity: 100,
          unit: 'kg',
          status: 'harvested',
          events: [{
            eventId: 'event_001',
            eventType: 'harvest',
            timestamp: new Date('2024-01-15'),
            location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka, India' },
            actorId: 'farmer001',
            actorRole: 'farmer',
            description: 'Harvested 100 kg of Ashwagandha',
            compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
          }],
          complianceStatus: {
            geoFencing: true,
            seasonal: true,
            quality: true,
            species: true,
            overall: true,
            lastChecked: new Date(),
            violations: []
          },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: 'demo_batch_002',
          batchId: 'BATCH002',
          species: 'Turmeric',
          harvestDate: new Date('2024-01-20'),
          harvestLocation: {
            latitude: 19.0760,
            longitude: 72.8777,
            address: 'Mumbai, Maharashtra, India'
          },
          farmerId: {
            _id: 'demo_farmer_001',
            userId: 'farmer001',
            username: 'john_farmer',
            organization: 'Green Valley Farms',
            profile: {}
          },
          quantity: 150,
          unit: 'kg',
          status: 'processed',
          events: [
            {
              eventId: 'event_002',
              eventType: 'harvest',
              timestamp: new Date('2024-01-20'),
              location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra, India' },
              actorId: 'farmer001',
              actorRole: 'farmer',
              description: 'Harvested 150 kg of Turmeric',
              compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
            },
            {
              eventId: 'event_003',
              eventType: 'processing',
              timestamp: new Date('2024-01-22'),
              location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Processing Plant' },
              actorId: 'processor001',
              actorRole: 'processor',
              description: 'Processed and dried turmeric',
              compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
            }
          ],
          complianceStatus: {
            geoFencing: true,
            seasonal: true,
            quality: true,
            species: true,
            overall: true,
            lastChecked: new Date(),
            violations: []
          },
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-22')
        }
      ];

      const batch = demoBatches.find(b => b.batchId === req.params.batchId);

      if (!batch) {
        return res.status(404).json({
          success: false,
          error: 'Batch not found'
        });
      }

      // Check if user has permission to view this batch
      if (!['admin', 'regulator'].includes(req.user.role) && 
          batch.farmerId.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this batch'
        });
      }

      return res.json({
        success: true,
        data: batch
      });
    }

    const batch = await HerbBatch.findOne({ batchId: req.params.batchId })
      .populate('farmerId', 'userId username organization profile');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Check if user has permission to view this batch
    if (!['admin', 'regulator'].includes(req.user.role) && 
        batch.farmerId.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this batch'
      });
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    logger.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update herb batch
// @route   PUT /api/batches/:batchId
// @access  Private (Farmers - own batches only)
router.put('/:batchId', protect, [
  body('species').optional().notEmpty().withMessage('Species cannot be empty'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('unit').optional().isIn(['kg', 'g', 'lb', 'oz', 'tons', 'pieces']).withMessage('Invalid unit')
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

    const batch = await HerbBatch.findOne({ batchId: req.params.batchId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Check if user owns this batch or is admin
    if (batch.farmerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this batch'
      });
    }

    // Update batch
    const updatedBatch = await HerbBatch.findOneAndUpdate(
      { batchId: req.params.batchId },
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Batch updated: ${req.params.batchId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: updatedBatch
    });
  } catch (error) {
    logger.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete herb batch
// @route   DELETE /api/batches/:batchId
// @access  Private (Admin only)
router.delete('/:batchId', protect, authorize('admin'), async (req, res) => {
  try {
    const batch = await HerbBatch.findOne({ batchId: req.params.batchId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    await HerbBatch.findOneAndDelete({ batchId: req.params.batchId });

    logger.info(`Batch deleted: ${req.params.batchId} by ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    logger.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
