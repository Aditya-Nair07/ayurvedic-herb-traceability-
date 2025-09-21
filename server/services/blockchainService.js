const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contract = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Try to import Fabric dependencies, but don't fail if not available
      let Gateway, Wallets;
      try {
        const fabricNetwork = require('fabric-network');
        Gateway = fabricNetwork.Gateway;
        Wallets = fabricNetwork.Wallets;
      } catch (importError) {
        logger.warn('Fabric dependencies not available, running in demo mode');
        this.isInitialized = false;
        return;
      }

      // Load connection profile
      const ccpPath = path.resolve(__dirname, '../../blockchain/connection-profile.json');
      if (!fs.existsSync(ccpPath)) {
        logger.warn('Connection profile not found, running in demo mode');
        this.isInitialized = false;
        return;
      }
      
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user
      const userExists = await wallet.get('appUser');
      if (!userExists) {
        logger.warn('User not enrolled, running in demo mode');
        this.isInitialized = false;
        return;
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      this.network = await this.gateway.getNetwork(process.env.FABRIC_CHANNEL_NAME || 'herb-channel');

      // Get the contract from the network
      this.contract = this.network.getContract(process.env.FABRIC_CHAINCODE_NAME || 'herb-traceability');

      this.isInitialized = true;
      logger.info('Blockchain service initialized successfully');
    } catch (error) {
      logger.warn('Blockchain service not available, running in demo mode:', error.message);
      this.isInitialized = false;
    }
  }

  async createHerbBatch(batchData) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock transaction');
      return {
        transactionId: 'mock-tx-' + Date.now(),
        batchId: batchData.batchId,
        status: 'success',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const {
        batchId,
        species,
        farmerId,
        quantity,
        unit,
        latitude,
        longitude,
        address
      } = batchData;

      const result = await this.contract.submitTransaction(
        'CreateHerbBatch',
        batchId,
        species,
        farmerId,
        quantity.toString(),
        unit,
        latitude.toString(),
        longitude.toString(),
        address
      );

      logger.info(`Herb batch created: ${batchId}`);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Failed to create herb batch:', error);
      throw error;
    }
  }

  async addEvent(batchId, eventData) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock transaction');
      return {
        transactionId: 'mock-tx-' + Date.now(),
        batchId: batchId,
        eventType: eventData.eventType,
        status: 'success',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const {
        eventType,
        actorId,
        description,
        latitude,
        longitude,
        ipfsHash,
        qualityData
      } = eventData;

      const qualityDataJSON = qualityData ? JSON.stringify(qualityData) : '';

      const result = await this.contract.submitTransaction(
        'AddEvent',
        batchId,
        eventType,
        actorId,
        description,
        latitude.toString(),
        longitude.toString(),
        ipfsHash || '',
        qualityDataJSON
      );

      logger.info(`Event added to batch ${batchId}: ${eventType}`);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Failed to add event:', error);
      throw error;
    }
  }

  async getHerbBatch(batchId) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock data');
      return {
        batchId: batchId,
        status: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.evaluateTransaction('GetHerbBatch', batchId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to get herb batch ${batchId}:`, error);
      throw error;
    }
  }

  async getUser(userId) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock data');
      return {
        userId: userId,
        status: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.evaluateTransaction('GetUser', userId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to get user ${userId}:`, error);
      throw error;
    }
  }

  async generateQRCode(batchId) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock transaction');
      return {
        transactionId: 'mock-tx-' + Date.now(),
        batchId: batchId,
        qrCodeGenerated: true,
        status: 'success',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.submitTransaction('GenerateQRCode', batchId);
      logger.info(`QR code generated for batch: ${batchId}`);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to generate QR code for batch ${batchId}:`, error);
      throw error;
    }
  }

  async queryAllBatches() {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock data');
      return {
        batches: [],
        status: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.evaluateTransaction('QueryAllBatches');
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Failed to query all batches:', error);
      throw error;
    }
  }

  async queryBatchesBySpecies(species) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock data');
      return {
        batches: [],
        species: species,
        status: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.evaluateTransaction('QueryBatchesBySpecies', species);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to query batches by species ${species}:`, error);
      throw error;
    }
  }

  async queryBatchesByFarmer(farmerId) {
    if (!this.isInitialized) {
      logger.warn('Blockchain not available, returning mock data');
      return {
        batches: [],
        farmerId: farmerId,
        status: 'mock',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const result = await this.contract.evaluateTransaction('QueryBatchesByFarmer', farmerId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error(`Failed to query batches by farmer ${farmerId}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.gateway = null;
      this.network = null;
      this.contract = null;
      this.isInitialized = false;
      logger.info('Blockchain service disconnected');
    }
  }

  // Helper method to check if service is ready
  isReady() {
    return this.isInitialized && this.contract !== null;
  }
}

module.exports = new BlockchainService();
