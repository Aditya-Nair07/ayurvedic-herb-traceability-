const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const ipfsService = require('../services/ipfsService');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// @desc    Upload file to IPFS
// @route   POST /api/ipfs/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), [
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { metadata } = req.body;
    const fileMetadata = {
      ...metadata,
      uploadedBy: req.user.userId,
      uploadedAt: new Date().toISOString(),
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    // Upload file to IPFS
    const result = await ipfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      fileMetadata
    );

    logger.info(`File uploaded to IPFS: ${result.hash} by ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        hash: result.hash,
        size: result.size,
        path: result.path,
        url: ipfsService.getFileURL(result.hash),
        publicUrl: ipfsService.getPublicURL(result.hash),
        metadata: fileMetadata
      }
    });
  } catch (error) {
    logger.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// @desc    Upload multiple files to IPFS
// @route   POST /api/ipfs/upload-multiple
// @access  Private
router.post('/upload-multiple', protect, upload.array('files', 10), [
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    const { metadata } = req.body;
    const results = [];

    // Upload each file
    for (const file of req.files) {
      const fileMetadata = {
        ...metadata,
        uploadedBy: req.user.userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };

      const result = await ipfsService.uploadFile(
        file.buffer,
        file.originalname,
        fileMetadata
      );

      results.push({
        hash: result.hash,
        size: result.size,
        path: result.path,
        url: ipfsService.getFileURL(result.hash),
        publicUrl: ipfsService.getPublicURL(result.hash),
        metadata: fileMetadata
      });
    }

    logger.info(`${results.length} files uploaded to IPFS by ${req.user.userId}`);

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    logger.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// @desc    Upload JSON data to IPFS
// @route   POST /api/ipfs/upload-json
// @access  Private
router.post('/upload-json', protect, [
  body('data').notEmpty().withMessage('Data is required'),
  body('fileName').optional().isString().withMessage('File name must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
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

    const { data, fileName = 'data.json', metadata } = req.body;

    const jsonMetadata = {
      ...metadata,
      uploadedBy: req.user.userId,
      uploadedAt: new Date().toISOString(),
      dataType: 'json'
    };

    // Upload JSON to IPFS
    const result = await ipfsService.uploadJSON(data, fileName);

    logger.info(`JSON data uploaded to IPFS: ${result.hash} by ${req.user.userId}`);

    res.json({
      success: true,
      data: {
        hash: result.hash,
        size: result.size,
        path: result.path,
        url: ipfsService.getFileURL(result.hash),
        publicUrl: ipfsService.getPublicURL(result.hash),
        metadata: jsonMetadata
      }
    });
  } catch (error) {
    logger.error('Upload JSON error:', error);
    res.status(500).json({
      success: false,
      error: 'JSON upload failed'
    });
  }
});

// @desc    Retrieve file from IPFS
// @route   GET /api/ipfs/retrieve/:hash
// @access  Private
router.get('/retrieve/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    // Retrieve file from IPFS
    const fileBuffer = await ipfsService.retrieveFile(hash);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${hash}"`);

    // Send file
    res.send(fileBuffer);
  } catch (error) {
    logger.error(`Retrieve file error for hash ${req.params.hash}:`, error);
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// @desc    Retrieve JSON data from IPFS
// @route   GET /api/ipfs/retrieve-json/:hash
// @access  Private
router.get('/retrieve-json/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    // Retrieve JSON from IPFS
    const jsonData = await ipfsService.retrieveJSON(hash);

    res.json({
      success: true,
      data: jsonData
    });
  } catch (error) {
    logger.error(`Retrieve JSON error for hash ${req.params.hash}:`, error);
    res.status(404).json({
      success: false,
      error: 'JSON data not found'
    });
  }
});

// @desc    Get file information
// @route   GET /api/ipfs/info/:hash
// @access  Private
router.get('/info/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    // Get file info from IPFS
    const fileInfo = await ipfsService.getFileInfo(hash);
    const isPinned = await ipfsService.isFilePinned(hash);

    res.json({
      success: true,
      data: {
        ...fileInfo,
        isPinned,
        url: ipfsService.getFileURL(hash),
        publicUrl: ipfsService.getPublicURL(hash)
      }
    });
  } catch (error) {
    logger.error(`Get file info error for hash ${req.params.hash}:`, error);
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// @desc    Pin file in IPFS
// @route   POST /api/ipfs/pin/:hash
// @access  Private
router.post('/pin/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    // Pin file in IPFS
    await ipfsService.pinFile(hash);

    logger.info(`File pinned in IPFS: ${hash} by ${req.user.userId}`);

    res.json({
      success: true,
      message: 'File pinned successfully'
    });
  } catch (error) {
    logger.error(`Pin file error for hash ${req.params.hash}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to pin file'
    });
  }
});

// @desc    Unpin file from IPFS
// @route   DELETE /api/ipfs/pin/:hash
// @access  Private
router.delete('/pin/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    // Unpin file from IPFS
    await ipfsService.unpinFile(hash);

    logger.info(`File unpinned from IPFS: ${hash} by ${req.user.userId}`);

    res.json({
      success: true,
      message: 'File unpinned successfully'
    });
  } catch (error) {
    logger.error(`Unpin file error for hash ${req.params.hash}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to unpin file'
    });
  }
});

// @desc    Get file URL
// @route   GET /api/ipfs/url/:hash
// @access  Public
router.get('/url/:hash', async (req, res) => {
  try {
    const { hash } = req.params;

    res.json({
      success: true,
      data: {
        hash,
        url: ipfsService.getFileURL(hash),
        publicUrl: ipfsService.getPublicURL(hash)
      }
    });
  } catch (error) {
    logger.error(`Get file URL error for hash ${req.params.hash}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file URL'
    });
  }
});

module.exports = router;
