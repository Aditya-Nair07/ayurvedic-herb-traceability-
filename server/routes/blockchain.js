const express = require('express');
const { protect } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get blockchain network status
// @route   GET /api/blockchain/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    // Generate realistic network statistics
    const networkStats = {
      status: 'healthy',
      totalTransactions: Math.floor(Math.random() * 10000) + 15000,
      totalBlocks: Math.floor(Math.random() * 5000) + 8000,
      activeNodes: 4,
      networkHashRate: '2.5 TH/s',
      avgBlockTime: '3.2s',
      lastBlockTime: new Date(Date.now() - Math.random() * 300000).toISOString(),
      chainHeight: Math.floor(Math.random() * 5000) + 8000,
      consensusAlgorithm: 'PBFT',
      networkId: 'herb-channel',
      chaincodeName: 'herb-traceability',
      uptime: '99.9%',
      currentTPS: 12.5,
      peers: [
        { id: 'peer0.org1.example.com', status: 'active', latency: '12ms' },
        { id: 'peer1.org1.example.com', status: 'active', latency: '15ms' },
        { id: 'orderer.example.com', status: 'active', latency: '8ms' },
        { id: 'ca.example.com', status: 'active', latency: '5ms' }
      ]
    };

    res.json({
      success: true,
      data: networkStats
    });
  } catch (error) {
    logger.error('Get blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get recent blockchain transactions
// @route   GET /api/blockchain/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Generate mock recent transactions
    const recentTransactions = Array.from({ length: limit }, (_, i) => ({
      id: `tx-${Date.now()}-${i}`,
      type: ['CreateBatch', 'AddEvent', 'GenerateQR', 'UpdateCompliance'][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      blockNumber: Math.floor(Math.random() * 5000) + 8000 - i,
      status: 'VALID',
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      batchId: `BATCH${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      actor: ['farmer001', 'processor001', 'lab001', 'regulator001'][Math.floor(Math.random() * 4)],
      hash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      networkId: 'herb-channel',
      chaincodeName: 'herb-traceability'
    }));

    // Sort by timestamp (newest first)
    recentTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      count: recentTransactions.length,
      data: recentTransactions
    });
  } catch (error) {
    logger.error('Get blockchain transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Verify transaction on blockchain
// @route   GET /api/blockchain/verify/:transactionId
// @access  Private
router.get('/verify/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Simulate blockchain verification
    const verificationResult = {
      transactionId,
      isValid: true,
      blockHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockNumber: Math.floor(Math.random() * 10000) + 150000,
      timestamp: new Date().toISOString(),
      confirmations: Math.floor(Math.random() * 100) + 50,
      networkId: 'herb-channel',
      chaincodeName: 'herb-traceability',
      status: 'CONFIRMED',
      endorsements: [
        { 
          mspId: 'Org1MSP', 
          signature: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          timestamp: new Date().toISOString()
        },
        { 
          mspId: 'OrdererMSP', 
          signature: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          timestamp: new Date().toISOString()
        }
      ],
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      dataHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      consensusAlgorithm: 'PBFT',
      immutabilityScore: 99.9
    };

    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    logger.error('Verify transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get blockchain analytics
// @route   GET /api/blockchain/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const analytics = {
      transactionVolume: {
        today: Math.floor(Math.random() * 500) + 100,
        thisWeek: Math.floor(Math.random() * 3000) + 1000,
        thisMonth: Math.floor(Math.random() * 12000) + 5000
      },
      blockProductionRate: {
        blocksPerHour: Math.floor(Math.random() * 1000) + 800,
        avgBlockTime: '3.2s',
        lastBlockTime: new Date(Date.now() - Math.random() * 300000).toISOString()
      },
      networkHealth: {
        uptime: '99.9%',
        activeNodes: 4,
        syncStatus: 'fully_synced',
        consensusHealth: 'healthy'
      },
      transactionTypes: [
        { type: 'CreateBatch', count: Math.floor(Math.random() * 1000) + 500, percentage: 35 },
        { type: 'AddEvent', count: Math.floor(Math.random() * 2000) + 1000, percentage: 45 },
        { type: 'GenerateQR', count: Math.floor(Math.random() * 500) + 200, percentage: 15 },
        { type: 'UpdateCompliance', count: Math.floor(Math.random() * 300) + 100, percentage: 5 }
      ],
      gasMetrics: {
        avgGasUsed: Math.floor(Math.random() * 50000) + 25000,
        totalGasConsumed: Math.floor(Math.random() * 10000000) + 5000000,
        gasEfficiency: '92.5%'
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Get blockchain analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;