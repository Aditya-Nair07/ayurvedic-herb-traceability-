const express = require('express');
const { body, validationResult, query } = require('express-validator');
const HerbBatch = require('../models/HerbBatch');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Check compliance for a batch
// @route   POST /api/compliance/check
// @access  Private (Regulator, Admin)
router.post('/check', protect, authorize('regulator', 'admin'), [
  body('batchId').notEmpty().withMessage('Batch ID is required')
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

    const { batchId } = req.body;

    const batch = await HerbBatch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Perform comprehensive compliance check
    const complianceCheck = await performComplianceCheck(batch);

    // Update batch compliance status
    batch.complianceStatus = complianceCheck.complianceStatus;
    batch.updatedAt = new Date();
    await batch.save();

    logger.info(`Compliance check performed for batch: ${batchId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        batchId: batch.batchId,
        complianceCheck,
        checkedAt: new Date().toISOString(),
        checkedBy: req.user.userId
      }
    });
  } catch (error) {
    logger.error('Compliance check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get compliance violations
// @route   GET /api/compliance/violations
// @access  Private (Regulator, Admin)
router.get('/violations', protect, authorize('regulator', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  query('status').optional().isIn(['open', 'resolved', 'investigating']).withMessage('Invalid status')
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

    // Build filter for batches with violations
    const filter = {
      'complianceStatus.overall': false,
      'complianceStatus.violations.0': { $exists: true }
    };

    const batches = await HerbBatch.find(filter)
      .populate('farmerId', 'userId username organization')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Extract violations
    const violations = [];
    batches.forEach(batch => {
      batch.complianceStatus.violations.forEach(violation => {
        violations.push({
          batchId: batch.batchId,
          species: batch.species,
          farmer: {
            userId: batch.farmerId.userId,
            username: batch.farmerId.username,
            organization: batch.farmerId.organization
          },
          violation,
          severity: determineViolationSeverity(violation),
          status: 'open',
          detectedAt: batch.complianceStatus.lastChecked,
          batchStatus: batch.status
        });
      });
    });

    const total = await HerbBatch.countDocuments(filter);

    res.json({
      success: true,
      count: violations.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: violations
    });
  } catch (error) {
    logger.error('Get violations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get compliance statistics
// @route   GET /api/compliance/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Check if we're in demo mode
    if (global.demoUsers) {
      // Return demo stats
      const demoStats = {
        overview: {
          totalBatches: 2,
          compliantBatches: 2,
          nonCompliantBatches: 0,
          complianceRate: 100,
          totalViolations: 0,
          geoFencingViolations: 0,
          seasonalViolations: 0,
          qualityViolations: 0,
          speciesViolations: 0
        },
        complianceBySpecies: [
          { _id: 'Ashwagandha', totalBatches: 1, compliantBatches: 1, complianceRate: 1 },
          { _id: 'Turmeric', totalBatches: 1, compliantBatches: 1, complianceRate: 1 }
        ],
        monthlyCompliance: [
          { _id: { year: 2024, month: 1 }, totalBatches: 2, compliantBatches: 2, complianceRate: 1 }
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
      {
        $group: {
          _id: null,
          totalBatches: { $sum: 1 },
          compliantBatches: {
            $sum: { $cond: ['$complianceStatus.overall', 1, 0] }
          },
          nonCompliantBatches: {
            $sum: { $cond: ['$complianceStatus.overall', 0, 1] }
          },
          geoFencingViolations: {
            $sum: { $cond: ['$complianceStatus.geoFencing', 0, 1] }
          },
          seasonalViolations: {
            $sum: { $cond: ['$complianceStatus.seasonal', 0, 1] }
          },
          qualityViolations: {
            $sum: { $cond: ['$complianceStatus.quality', 0, 1] }
          },
          speciesViolations: {
            $sum: { $cond: ['$complianceStatus.species', 0, 1] }
          }
        }
      }
    ]);

    const complianceBySpecies = await HerbBatch.aggregate([
      {
        $group: {
          _id: '$species',
          totalBatches: { $sum: 1 },
          compliantBatches: {
            $sum: { $cond: ['$complianceStatus.overall', 1, 0] }
          },
          complianceRate: {
            $avg: { $cond: ['$complianceStatus.overall', 1, 0] }
          }
        }
      },
      {
        $sort: { complianceRate: 1 }
      }
    ]);

    const complianceByFarmer = await HerbBatch.aggregate([
      {
        $group: {
          _id: '$farmerId',
          totalBatches: { $sum: 1 },
          compliantBatches: {
            $sum: { $cond: ['$complianceStatus.overall', 1, 0] }
          },
          complianceRate: {
            $avg: { $cond: ['$complianceStatus.overall', 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'userId',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $project: {
          farmerId: '$_id',
          farmerName: '$farmer.username',
          organization: '$farmer.organization',
          totalBatches: 1,
          compliantBatches: 1,
          complianceRate: 1
        }
      },
      {
        $sort: { complianceRate: 1 }
      },
      { $limit: 10 }
    ]);

    const monthlyCompliance = await HerbBatch.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalBatches: { $sum: 1 },
          compliantBatches: {
            $sum: { $cond: ['$complianceStatus.overall', 1, 0] }
          },
          complianceRate: {
            $avg: { $cond: ['$complianceStatus.overall', 1, 0] }
          }
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
          totalBatches: 0,
          compliantBatches: 0,
          nonCompliantBatches: 0,
          geoFencingViolations: 0,
          seasonalViolations: 0,
          qualityViolations: 0,
          speciesViolations: 0
        },
        complianceBySpecies,
        complianceByFarmer,
        monthlyCompliance
      }
    });
  } catch (error) {
    logger.error('Get compliance stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get compliance report for a batch
// @route   GET /api/compliance/report/:batchId
// @access  Private (Regulator, Admin)
router.get('/report/:batchId', protect, authorize('regulator', 'admin'), async (req, res) => {
  try {
    const batch = await HerbBatch.findOne({ batchId: req.params.batchId })
      .populate('farmerId', 'userId username organization profile');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Generate detailed compliance report
    const report = {
      batch: {
        batchId: batch.batchId,
        species: batch.species,
        harvestDate: batch.harvestDate,
        harvestLocation: batch.harvestLocation,
        farmer: batch.farmerId,
        status: batch.status,
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt
      },
      complianceStatus: batch.complianceStatus,
      events: batch.events.map(event => ({
        eventId: event.eventId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        location: event.location,
        actorId: event.actorId,
        actorRole: event.actorRole,
        description: event.description,
        compliance: event.compliance
      })),
      qualityMetrics: batch.qualityMetrics,
      recommendations: generateComplianceRecommendations(batch),
      reportGeneratedAt: new Date().toISOString(),
      reportGeneratedBy: req.user.userId
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Get compliance report error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Helper function to perform comprehensive compliance check
async function performComplianceCheck(batch) {
  const violations = [];
  let geoFencing = true;
  let seasonal = true;
  let quality = true;
  let species = true;

  // Geo-fencing check
  if (!checkGeoFencing(batch.harvestLocation)) {
    geoFencing = false;
    violations.push('Harvest location outside approved zones');
  }

  // Seasonal check
  if (!checkSeasonalRestrictions(batch.harvestDate, batch.species)) {
    seasonal = false;
    violations.push('Harvest outside approved season');
  }

  // Quality check
  const qualityCheck = checkQualityStandards(batch);
  if (!qualityCheck.passed) {
    quality = false;
    violations.push(...qualityCheck.violations);
  }

  // Species conservation check
  if (!checkSpeciesConservation(batch.species)) {
    species = false;
    violations.push('Species not approved for harvesting');
  }

  const overall = geoFencing && seasonal && quality && species;

  return {
    complianceStatus: {
      geoFencing,
      seasonal,
      quality,
      species,
      overall,
      lastChecked: new Date(),
      violations
    },
    violations
  };
}

// Helper function to check geo-fencing
function checkGeoFencing(location) {
  // Define allowed harvest zones (latitude, longitude, radius in meters)
  const allowedZones = [
    { lat: 12.9716, lng: 77.5946, radius: 1000 }, // Bangalore
    { lat: 19.0760, lng: 72.8777, radius: 1000 }, // Mumbai
    { lat: 28.7041, lng: 77.1025, radius: 1000 }  // Delhi
  ];

  for (const zone of allowedZones) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      zone.lat,
      zone.lng
    );
    if (distance <= zone.radius) {
      return true;
    }
  }

  return false;
}

// Helper function to check seasonal restrictions
function checkSeasonalRestrictions(harvestDate, species) {
  const month = new Date(harvestDate).getMonth() + 1; // 1-12
  
  // For demo purposes, allow harvesting in months 3-11 (March to November)
  // In production, this would check against species-specific seasonal data
  return month >= 3 && month <= 11;
}

// Helper function to check quality standards
function checkQualityStandards(batch) {
  const violations = [];
  
  // Check if quality metrics exist
  if (!batch.qualityMetrics || Object.keys(batch.qualityMetrics).length === 0) {
    violations.push('No quality metrics available');
    return { passed: false, violations };
  }

  // Check purity
  if (batch.qualityMetrics.purity && batch.qualityMetrics.purity < 95) {
    violations.push('Purity below minimum threshold (95%)');
  }

  // Check moisture content
  if (batch.qualityMetrics.moisture && batch.qualityMetrics.moisture > 12) {
    violations.push('Moisture content above maximum threshold (12%)');
  }

  // Check ash content
  if (batch.qualityMetrics.ashContent && batch.qualityMetrics.ashContent > 8) {
    violations.push('Ash content above maximum threshold (8%)');
  }

  // Check heavy metals
  if (batch.qualityMetrics.heavyMetals) {
    const heavyMetalLimits = {
      lead: 10,
      cadmium: 2,
      mercury: 1,
      arsenic: 5
    };

    for (const [metal, limit] of Object.entries(heavyMetalLimits)) {
      if (batch.qualityMetrics.heavyMetals[metal] && 
          batch.qualityMetrics.heavyMetals[metal] > limit) {
        violations.push(`${metal} content above maximum threshold (${limit} ppm)`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

// Helper function to check species conservation
function checkSpeciesConservation(species) {
  // For demo purposes, all species are allowed
  // In production, this would check against conservation databases
  const allowedSpecies = [
    'ashwagandha',
    'tulsi',
    'neem',
    'amla',
    'brahmi',
    'shankhpushpi',
    'guduchi',
    'arjuna'
  ];

  return allowedSpecies.includes(species.toLowerCase());
}

// Helper function to determine violation severity
function determineViolationSeverity(violation) {
  const criticalKeywords = ['heavy metals', 'pesticides', 'contamination'];
  const highKeywords = ['purity', 'quality', 'species'];
  const mediumKeywords = ['seasonal', 'geo-fencing'];
  
  const lowerViolation = violation.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerViolation.includes(keyword))) {
    return 'critical';
  } else if (highKeywords.some(keyword => lowerViolation.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => lowerViolation.includes(keyword))) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Helper function to generate compliance recommendations
function generateComplianceRecommendations(batch) {
  const recommendations = [];

  if (!batch.complianceStatus.geoFencing) {
    recommendations.push({
      type: 'location',
      priority: 'high',
      message: 'Ensure future harvests are conducted within approved geographical zones',
      action: 'Verify harvest location coordinates against approved zones'
    });
  }

  if (!batch.complianceStatus.seasonal) {
    recommendations.push({
      type: 'timing',
      priority: 'medium',
      message: 'Plan harvests during approved seasonal windows',
      action: 'Consult seasonal harvesting calendar for this species'
    });
  }

  if (!batch.complianceStatus.quality) {
    recommendations.push({
      type: 'quality',
      priority: 'high',
      message: 'Improve quality control measures and testing protocols',
      action: 'Implement stricter quality testing and monitoring procedures'
    });
  }

  if (!batch.complianceStatus.species) {
    recommendations.push({
      type: 'species',
      priority: 'critical',
      message: 'Verify species approval for commercial harvesting',
      action: 'Check species conservation status and regulatory approvals'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      priority: 'low',
      message: 'Batch is compliant with all regulations',
      action: 'Continue current practices'
    });
  }

  return recommendations;
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;
