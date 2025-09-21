const express = require('express');
const { body, validationResult, query } = require('express-validator');
const HerbBatch = require('../models/HerbBatch');
const { protect, authorize, hasPermission } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for demo events
if (!global.demoEvents) {
  global.demoEvents = [
    {
      eventId: 'event_001',
      batchId: 'BATCH001',
      species: 'Ashwagandha',
      farmerId: 'farmer001',
      eventType: 'harvest',
      type: 'harvest',
      timestamp: new Date('2024-01-15'),
      location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka, India' },
      actorId: 'farmer001',
      actorRole: 'farmer',
      description: 'Harvested 100 kg of Ashwagandha',
      compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
    },
    {
      eventId: 'event_002',
      batchId: 'BATCH002',
      species: 'Turmeric',
      farmerId: 'farmer001',
      eventType: 'harvest',
      type: 'harvest',
      timestamp: new Date('2024-01-20'),
      location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra, India' },
      actorId: 'farmer001',
      actorRole: 'farmer',
      description: 'Harvested 150 kg of Turmeric',
      compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
    },
    {
      eventId: 'event_003',
      batchId: 'BATCH002',
      species: 'Turmeric',
      farmerId: 'farmer001',
      eventType: 'processing',
      type: 'processing',
      timestamp: new Date('2024-01-22'),
      location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Processing Plant' },
      actorId: 'processor001',
      actorRole: 'processor',
      description: 'Processed and dried turmeric',
      compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' }
    }
  ];
}

// @desc    Add event to herb batch
// @route   POST /api/events
// @access  Private
router.post('/', protect, [
  body('batchId').notEmpty().withMessage('Batch ID is required'),
  body('type').isIn(['harvest', 'processing', 'testing', 'packaging', 'transport', 'retail']).withMessage('Invalid event type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').optional().isString().withMessage('Location must be a string')
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
      type: eventType,
      description,
      location,
      qualityData,
      certificates,
      metadata
    } = req.body;

    // Parse location if provided, or use defaults
    let locationData = {
      latitude: 12.9716, // Default to Bangalore
      longitude: 77.5946,
      address: location || 'Demo Location'
    };

    // Try to parse coordinates if location contains them
    if (location && location.includes(',')) {
      const parts = location.split(',');
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          locationData.latitude = lat;
          locationData.longitude = lng;
          locationData.address = parts.slice(2).join(',').trim() || location;
        }
      }
    }

    // Check if we're in demo mode
    if (global.demoUsers) {
      // In demo mode, create and store the event
      const demoEvent = {
        eventId: `event_demo_${Date.now()}`,
        batchId,
        species: 'Demo Herb',
        farmerId: req.user.userId,
        eventType,
        type: eventType, // Add both fields for compatibility
        timestamp: new Date(),
        location: locationData,
        actorId: req.user.userId,
        actorRole: req.user.role,
        description,
        ipfsHash: '',
        certificates: certificates || [],
        qualityData: qualityData || {},
        compliance: {
          passed: true,
          checkedAt: new Date(),
          checkedBy: 'system'
        },
        metadata: metadata || {}
      };

      // Add to global demo events array
      global.demoEvents.push(demoEvent);

      // Simulate blockchain transaction
      const blockchainTx = {
        transactionId: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blockHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: Math.floor(Math.random() * 10000) + 150000,
        status: 'VALID',
        consensusAlgorithm: 'PBFT',
        networkId: 'herb-channel',
        chaincodeName: 'herb-traceability',
        gasUsed: Math.floor(Math.random() * 50000) + 21000
      };

      logger.info(`Demo event created for batch ${batchId}: ${eventType} by ${req.user.userId}`);
      logger.info(`Blockchain transaction: ${blockchainTx.transactionId}`);

      return res.status(201).json({
        success: true,
        data: {
          event: {
            ...demoEvent,
            blockchainTx
          },
          message: 'Event created successfully (demo mode)',
          blockchain: blockchainTx
        }
      });
    }

    // Find the batch
    const batch = await HerbBatch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Check permissions based on event type
    const requiredPermissions = {
      harvest: 'add_harvest_event',
      processing: 'add_processing_event',
      quality_test: 'add_quality_test',
      packaging: 'add_packaging_event',
      transport: 'add_transport_event',
      retail: 'add_retail_event'
    };

    if (!req.user.permissions.includes(requiredPermissions[eventType])) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${requiredPermissions[eventType]} required`
      });
    }

    // Handle file uploads for certificates
    let ipfsHashes = {};
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const ipfsResult = await ipfsService.uploadFile(
            file.buffer,
            file.originalname,
            {
              batchId,
              eventType,
              uploadedBy: req.user.userId,
              uploadedAt: new Date().toISOString()
            }
          );
          ipfsHashes[file.fieldname] = ipfsResult.hash;
        } catch (ipfsError) {
          logger.error('IPFS upload error:', ipfsError);
          return res.status(503).json({
            success: false,
            error: 'File upload service unavailable'
          });
        }
      }
    }

    // Create event data
    const eventData = {
      eventId: `event_${batchId}_${Date.now()}`,
      eventType,
      timestamp: new Date(),
      location: locationData,
      actorId: req.user.userId,
      actorRole: req.user.role,
      description,
      ipfsHash: ipfsHashes.certificate || '',
      certificates: certificates || [],
      qualityData: qualityData || {},
      compliance: {
        passed: true,
        checkedAt: new Date(),
        checkedBy: 'system'
      },
      metadata: metadata || {}
    };

    // Add event to blockchain
    try {
      await blockchainService.addEvent(batchId, {
        eventType,
        actorId: req.user.userId,
        description,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        ipfsHash: ipfsHashes.certificate || '',
        qualityData
      });
    } catch (blockchainError) {
      logger.error('Blockchain error during event addition:', blockchainError);
      return res.status(503).json({
        success: false,
        error: 'Blockchain service unavailable'
      });
    }

    // Add event to database
    batch.events.push(eventData);
    batch.updatedAt = new Date();

    // Update status based on event type
    const statusMap = {
      harvest: 'harvested',
      processing: 'processed',
      quality_test: 'tested',
      packaging: 'packaged',
      transport: 'in_transit',
      retail: 'retailed'
    };
    batch.status = statusMap[eventType] || batch.status;

    // Update IPFS hashes
    Object.assign(batch.ipfsHashes, ipfsHashes);

    await batch.save();

    logger.info(`Event added to batch ${batchId}: ${eventType} by ${req.user.userId}`);

    res.status(201).json({
      success: true,
      data: {
        event: eventData,
        batch: batch
      }
    });
  } catch (error) {
    logger.error('Add event error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get events for a batch
// @route   GET /api/events/batch/:batchId
// @access  Private
router.get('/batch/:batchId', protect, async (req, res) => {
  try {
    const batch = await HerbBatch.findOne({ batchId: req.params.batchId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Check if user has permission to view this batch
    if (!['admin', 'regulator'].includes(req.user.role) && 
        batch.farmerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this batch'
      });
    }

    const { eventType, actorId, limit = 50 } = req.query;

    let events = batch.events;

    // Filter by event type if provided
    if (eventType) {
      events = events.filter(event => event.eventType === eventType);
    }

    // Filter by actor if provided
    if (actorId) {
      events = events.filter(event => event.actorId === actorId);
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    if (limit) {
      events = events.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    logger.error('Get batch events error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all events (with filters)
// @route   GET /api/events
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('eventType').optional().isString().withMessage('Event type must be a string'),
  query('actorId').optional().isString().withMessage('Actor ID must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
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
      // Return demo events from global storage
      let demoEvents = [...global.demoEvents]; // Clone the array

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Apply filters
      if (req.query.eventType) {
        demoEvents = demoEvents.filter(event => event.eventType === req.query.eventType || event.type === req.query.eventType);
      }
      
      if (req.query.actorId) {
        demoEvents = demoEvents.filter(event => event.actorId === req.query.actorId);
      }
      
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        demoEvents = demoEvents.filter(event => new Date(event.timestamp) >= startDate);
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        demoEvents = demoEvents.filter(event => new Date(event.timestamp) <= endDate);
      }

      // If user is not admin or regulator, only show events from their batches
      if (!['admin', 'regulator'].includes(req.user.role)) {
        demoEvents = demoEvents.filter(event => event.farmerId === req.user.userId || event.actorId === req.user.userId);
      }

      // Sort by timestamp (newest first)
      demoEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const total = demoEvents.length;
      const paginatedEvents = demoEvents.slice(skip, skip + limit);

      return res.json({
        success: true,
        count: paginatedEvents.length,
        total,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          limit
        },
        data: paginatedEvents
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [
      // Unwind events array
      { $unwind: '$events' },
      
      // Add batch information to each event
      {
        $addFields: {
          'events.batchId': '$batchId',
          'events.species': '$species',
          'events.farmerId': '$farmerId'
        }
      },
      
      // Replace root with event
      { $replaceRoot: { newRoot: '$events' } }
    ];

    // Add filters
    const matchStage = {};

    if (req.query.eventType) {
      matchStage.eventType = req.query.eventType;
    }

    if (req.query.actorId) {
      matchStage.actorId = req.query.actorId;
    }

    if (req.query.startDate || req.query.endDate) {
      matchStage.timestamp = {};
      if (req.query.startDate) {
        matchStage.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        matchStage.timestamp.$lte = new Date(req.query.endDate);
      }
    }

    // If user is not admin or regulator, only show events from their batches
    if (!['admin', 'regulator'].includes(req.user.role)) {
      matchStage.farmerId = req.user.userId;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Add sorting and pagination
    pipeline.push(
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Skip MongoDB operations in demo mode - already handled above
    const events = await HerbBatch.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.pop(); // Remove limit
    countPipeline.pop(); // Remove skip
    countPipeline.push({ $count: 'total' });
    
    const countResult = await HerbBatch.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      count: events.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: events
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // Calculate stats from global demo events
      const allEvents = global.demoEvents;
      
      // Filter events based on user role
      let filteredEvents = allEvents;
      if (!['admin', 'regulator'].includes(req.user.role)) {
        filteredEvents = allEvents.filter(event => event.farmerId === req.user.userId || event.actorId === req.user.userId);
      }
      
      // Calculate event type breakdown
      const eventTypeBreakdown = {};
      filteredEvents.forEach(event => {
        const type = event.eventType || event.type;
        if (!eventTypeBreakdown[type]) {
          eventTypeBreakdown[type] = { count: 0, totalLat: 0, totalLng: 0 };
        }
        eventTypeBreakdown[type].count++;
        eventTypeBreakdown[type].totalLat += event.location.latitude || 0;
        eventTypeBreakdown[type].totalLng += event.location.longitude || 0;
      });
      
      const eventTypeStats = Object.keys(eventTypeBreakdown).map(type => ({
        _id: type,
        count: eventTypeBreakdown[type].count,
        avgLatitude: eventTypeBreakdown[type].totalLat / eventTypeBreakdown[type].count,
        avgLongitude: eventTypeBreakdown[type].totalLng / eventTypeBreakdown[type].count
      }));
      
      // Calculate daily activity
      const dailyActivity = {};
      filteredEvents.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      });
      
      const dailyStats = Object.keys(dailyActivity)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 30)
        .map(date => ({ _id: date, count: dailyActivity[date] }));
      
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const todayEvents = filteredEvents.filter(e => new Date(e.timestamp).toISOString().split('T')[0] === today).length;
      const thisWeekEvents = filteredEvents.filter(e => new Date(e.timestamp).toISOString().split('T')[0] >= thisWeek).length;
      const thisMonthEvents = filteredEvents.filter(e => new Date(e.timestamp).toISOString().split('T')[0] >= thisMonth).length;
      
      const demoStats = {
        overview: {
          totalEvents: filteredEvents.length,
          todayEvents,
          thisWeekEvents,
          thisMonthEvents
        },
        eventTypeBreakdown: eventTypeStats,
        dailyActivity: dailyStats
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
      { $unwind: '$events' },
      {
        $group: {
          _id: '$events.eventType',
          count: { $sum: 1 },
          avgLatitude: { $avg: '$events.location.latitude' },
          avgLongitude: { $avg: '$events.location.longitude' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const dailyStats = await HerbBatch.aggregate([
      { $match: matchFilter },
      { $unwind: '$events' },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$events.timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      { $limit: 30 }
    ]);

    const totalEvents = await HerbBatch.aggregate([
      { $match: matchFilter },
      { $unwind: '$events' },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalEvents: totalEvents[0]?.total || 0,
          todayEvents: 0, // Could calculate this with date filtering
          thisWeekEvents: 0, // Could calculate this with date filtering
          thisMonthEvents: 0 // Could calculate this with date filtering
        },
        eventTypeBreakdown: stats,
        dailyActivity: dailyStats
      }
    });
  } catch (error) {
    logger.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get event by ID
// @route   GET /api/events/:eventId
// @access  Private
router.get('/:eventId', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // Return demo event data
      const demoEvents = [
        {
          eventId: 'event_001',
          eventType: 'harvest',
          timestamp: new Date('2024-01-15'),
          location: { latitude: 12.9716, longitude: 77.5946, address: 'Bangalore, Karnataka, India' },
          actorId: 'farmer001',
          actorRole: 'farmer',
          description: 'Harvested 100 kg of Ashwagandha',
          compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' },
          qualityData: { moisture: 12.5, purity: 98.5 },
          certificates: []
        },
        {
          eventId: 'event_002',
          eventType: 'harvest',
          timestamp: new Date('2024-01-20'),
          location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai, Maharashtra, India' },
          actorId: 'farmer001',
          actorRole: 'farmer',
          description: 'Harvested 150 kg of Turmeric',
          compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' },
          qualityData: { moisture: 10.2, purity: 99.1 },
          certificates: []
        },
        {
          eventId: 'event_003',
          eventType: 'processing',
          timestamp: new Date('2024-01-22'),
          location: { latitude: 19.0760, longitude: 72.8777, address: 'Mumbai Processing Plant' },
          actorId: 'processor001',
          actorRole: 'processor',
          description: 'Processed and dried turmeric',
          compliance: { passed: true, checkedAt: new Date(), checkedBy: 'system' },
          qualityData: { moisture: 8.5, purity: 99.3 },
          certificates: []
        }
      ];

      const event = demoEvents.find(e => e.eventId === req.params.eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Check if user has permission to view this event
      if (!['admin', 'regulator'].includes(req.user.role) && 
          event.actorId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this event'
        });
      }

      return res.json({
        success: true,
        data: event
      });
    }

    const batch = await HerbBatch.findOne({
      'events.eventId': req.params.eventId
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = batch.events.find(e => e.eventId === req.params.eventId);

    // Check if user has permission to view this event
    if (!['admin', 'regulator'].includes(req.user.role) && 
        batch.farmerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this event'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:eventId
// @access  Private (Actor or Admin)
router.put('/:eventId', protect, [
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('qualityData').optional().isObject().withMessage('Quality data must be an object')
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

    const batch = await HerbBatch.findOne({
      'events.eventId': req.params.eventId
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = batch.events.find(e => e.eventId === req.params.eventId);

    // Check if user is the actor or admin
    if (event.actorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this event'
      });
    }

    // Update event
    Object.assign(event, req.body);
    event.updatedAt = new Date();

    await batch.save();

    logger.info(`Event updated: ${req.params.eventId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
