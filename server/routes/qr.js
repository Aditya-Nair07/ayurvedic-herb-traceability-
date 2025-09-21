const express = require('express');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const HerbBatch = require('../models/HerbBatch');
const { protect, hasPermission } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Generate QR code for a batch
// @route   POST /api/qr/generate
// @access  Private (Processors, Admin)
router.post('/generate', protect, hasPermission('generate_qr'), [
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

    // Find the batch
    const batch = await HerbBatch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Check if batch is ready for QR code generation (packaging complete)
    if (batch.status !== 'packaged') {
      return res.status(400).json({
        success: false,
        error: 'Batch must be packaged before QR code can be generated'
      });
    }

    // Check if QR code already exists
    if (batch.qrCodeGenerated) {
      return res.status(400).json({
        success: false,
        error: 'QR code already generated for this batch'
      });
    }

    // Generate QR code data
    const qrData = {
      batchId: batch.batchId,
      species: batch.species,
      status: batch.status,
      harvestDate: batch.harvestDate,
      farmerId: batch.farmerId,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/batch/${batch.batchId}`,
      blockchainTxId: batch.blockchainTxId,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.userId
    };

    // Generate QR code on blockchain
    try {
      await blockchainService.generateQRCode(batchId);
    } catch (blockchainError) {
      logger.error('Blockchain error during QR code generation:', blockchainError);
      return res.status(503).json({
        success: false,
        error: 'Blockchain service unavailable'
      });
    }

    // Generate QR code image
    let qrCodeImage;
    try {
      qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
    } catch (qrError) {
      logger.error('QR code generation error:', qrError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate QR code image'
      });
    }

    // Update batch with QR code information
    batch.qrCodeGenerated = true;
    batch.qrCodeHash = Buffer.from(JSON.stringify(qrData)).toString('base64');
    batch.updatedAt = new Date();

    await batch.save();

    logger.info(`QR code generated for batch: ${batchId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        batchId: batch.batchId,
        qrCodeData: qrData,
        qrCodeImage: qrCodeImage,
        qrCodeHash: batch.qrCodeHash,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Scan QR code and get batch information
// @route   POST /api/qr/scan
// @access  Private (Consumers, Retailers, Admin)
router.post('/scan', protect, hasPermission('scan_qr'), [
  body('qrData').notEmpty().withMessage('QR code data is required')
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

    const { qrData } = req.body;

    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code data format'
      });
    }

    const { batchId } = parsedData;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID not found in QR code data'
      });
    }

    // Get batch information
    const batch = await HerbBatch.findOne({ batchId })
      .populate('farmerId', 'userId username organization profile');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Verify QR code authenticity
    const expectedHash = Buffer.from(JSON.stringify({
      batchId: batch.batchId,
      species: batch.species,
      status: batch.status,
      harvestDate: batch.harvestDate,
      farmerId: batch.farmerId,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/batch/${batch.batchId}`,
      blockchainTxId: batch.blockchainTxId,
      generatedAt: parsedData.generatedAt,
      generatedBy: parsedData.generatedBy
    })).toString('base64');

    const isAuthentic = batch.qrCodeHash === expectedHash;

    // Prepare response data
    const responseData = {
      batch: {
        batchId: batch.batchId,
        species: batch.species,
        harvestDate: batch.harvestDate,
        harvestLocation: batch.harvestLocation,
        farmer: {
          userId: batch.farmerId.userId,
          username: batch.farmerId.username,
          organization: batch.farmerId.organization,
          profile: batch.farmerId.profile
        },
        quantity: batch.quantity,
        unit: batch.unit,
        status: batch.status,
        complianceStatus: batch.complianceStatus,
        qualityMetrics: batch.qualityMetrics,
        events: batch.events.map(event => ({
          eventId: event.eventId,
          eventType: event.eventType,
          timestamp: event.timestamp,
          location: event.location,
          actorId: event.actorId,
          actorRole: event.actorRole,
          description: event.description,
          qualityData: event.qualityData,
          compliance: event.compliance
        })),
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt
      },
      qrCodeInfo: {
        generatedAt: parsedData.generatedAt,
        generatedBy: parsedData.generatedBy,
        isAuthentic: isAuthentic,
        scanCount: batch.scanCount || 0
      }
    };

    // Increment scan count
    batch.scanCount = (batch.scanCount || 0) + 1;
    batch.lastScannedAt = new Date();
    await batch.save();

    logger.info(`QR code scanned for batch: ${batchId} by ${req.user.userId}`);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    logger.error('Scan QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get QR code information for a batch
// @route   GET /api/qr/batch/:batchId
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

    if (!batch.qrCodeGenerated) {
      return res.status(404).json({
        success: false,
        error: 'QR code not generated for this batch'
      });
    }

    // Generate QR code data
    const qrData = {
      batchId: batch.batchId,
      species: batch.species,
      status: batch.status,
      harvestDate: batch.harvestDate,
      farmerId: batch.farmerId,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/batch/${batch.batchId}`,
      blockchainTxId: batch.blockchainTxId,
      generatedAt: batch.updatedAt.toISOString(),
      generatedBy: req.user.userId
    };

    // Generate QR code image
    let qrCodeImage;
    try {
      qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
    } catch (qrError) {
      logger.error('QR code generation error:', qrError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate QR code image'
      });
    }

    res.json({
      success: true,
      data: {
        batchId: batch.batchId,
        qrCodeGenerated: batch.qrCodeGenerated,
        qrCodeHash: batch.qrCodeHash,
        qrCodeData: qrData,
        qrCodeImage: qrCodeImage,
        scanCount: batch.scanCount || 0,
        lastScannedAt: batch.lastScannedAt
      }
    });
  } catch (error) {
    logger.error('Get QR code info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Validate QR code authenticity
// @route   POST /api/qr/validate
// @access  Public
router.post('/validate', [
  body('qrData').notEmpty().withMessage('QR code data is required')
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

    const { qrData } = req.body;

    let parsedData;
    try {
      parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code data format'
      });
    }

    const { batchId } = parsedData;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: 'Batch ID not found in QR code data'
      });
    }

    // Get batch information
    const batch = await HerbBatch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found'
      });
    }

    // Verify QR code authenticity
    const expectedHash = Buffer.from(JSON.stringify({
      batchId: batch.batchId,
      species: batch.species,
      status: batch.status,
      harvestDate: batch.harvestDate,
      farmerId: batch.farmerId,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/batch/${batch.batchId}`,
      blockchainTxId: batch.blockchainTxId,
      generatedAt: parsedData.generatedAt,
      generatedBy: parsedData.generatedBy
    })).toString('base64');

    const isAuthentic = batch.qrCodeGenerated && batch.qrCodeHash === expectedHash;

    res.json({
      success: true,
      data: {
        isAuthentic,
        batchId: batch.batchId,
        species: batch.species,
        status: batch.status,
        complianceStatus: batch.complianceStatus,
        qrCodeGenerated: batch.qrCodeGenerated
      }
    });
  } catch (error) {
    logger.error('Validate QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
