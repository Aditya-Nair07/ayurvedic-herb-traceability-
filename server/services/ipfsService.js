const logger = require('../utils/logger');

class IPFSService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Try to import IPFS client, but don't fail if it's not available
      let create;
      try {
        const ipfsClient = require('ipfs-http-client');
        create = ipfsClient.create;
      } catch (importError) {
        logger.warn('IPFS client not available, running in demo mode');
        this.isInitialized = false;
        return;
      }

      const ipfsHost = process.env.IPFS_HOST || 'localhost';
      const ipfsPort = process.env.IPFS_PORT || 5001;
      const ipfsProtocol = process.env.IPFS_PROTOCOL || 'http';
      
      const ipfsUrl = `${ipfsProtocol}://${ipfsHost}:${ipfsPort}`;
      
      this.client = create(ipfsUrl);
      
      // Test connection
      const version = await this.client.version();
      logger.info(`Connected to IPFS node: ${version.version}`);
      
      this.isInitialized = true;
    } catch (error) {
      logger.warn('IPFS service not available, running in demo mode:', error.message);
      this.isInitialized = false;
    }
  }

  async uploadFile(fileBuffer, fileName, metadata = {}) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock hash');
      return {
        hash: 'mock-hash-' + Date.now(),
        size: fileBuffer.length,
        path: fileName,
        metadata: metadata
      };
    }

    try {
      // Add file to IPFS
      const result = await this.client.add({
        path: fileName,
        content: fileBuffer
      }, {
        pin: true,
        metadata: metadata
      });

      logger.info(`File uploaded to IPFS: ${result.cid.toString()}`);
      
      return {
        hash: result.cid.toString(),
        size: result.size,
        path: result.path,
        metadata: metadata
      };
    } catch (error) {
      logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(data, fileName = 'data.json') {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock hash');
      return {
        hash: 'mock-json-hash-' + Date.now(),
        size: JSON.stringify(data).length,
        path: fileName
      };
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const jsonBuffer = Buffer.from(jsonString, 'utf8');
      
      const result = await this.client.add({
        path: fileName,
        content: jsonBuffer
      }, {
        pin: true
      });

      logger.info(`JSON data uploaded to IPFS: ${result.cid.toString()}`);
      
      return {
        hash: result.cid.toString(),
        size: result.size,
        path: result.path
      };
    } catch (error) {
      logger.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  async retrieveFile(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock file');
      return Buffer.from('Mock file content for hash: ' + hash);
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const fileBuffer = Buffer.concat(chunks);
      logger.info(`File retrieved from IPFS: ${hash}`);
      
      return fileBuffer;
    } catch (error) {
      logger.error(`Failed to retrieve file from IPFS: ${hash}`, error);
      throw error;
    }
  }

  async retrieveJSON(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock JSON');
      return { mock: true, hash: hash, timestamp: new Date().toISOString() };
    }

    try {
      const fileBuffer = await this.retrieveFile(hash);
      const jsonString = fileBuffer.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error(`Failed to retrieve JSON from IPFS: ${hash}`, error);
      throw error;
    }
  }

  async pinFile(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, mock pin operation');
      return true;
    }

    try {
      await this.client.pin.add(hash);
      logger.info(`File pinned in IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error(`Failed to pin file in IPFS: ${hash}`, error);
      throw error;
    }
  }

  async unpinFile(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, mock unpin operation');
      return true;
    }

    try {
      await this.client.pin.rm(hash);
      logger.info(`File unpinned from IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error(`Failed to unpin file from IPFS: ${hash}`, error);
      throw error;
    }
  }

  async getFileInfo(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock file info');
      return {
        hash: hash,
        size: 1024,
        type: 'file',
        blocks: 1,
        cumulativeSize: 1024
      };
    }

    try {
      const stats = await this.client.files.stat(`/ipfs/${hash}`);
      return {
        hash: hash,
        size: stats.size,
        type: stats.type,
        blocks: stats.blocks,
        cumulativeSize: stats.cumulativeSize
      };
    } catch (error) {
      logger.error(`Failed to get file info from IPFS: ${hash}`, error);
      throw error;
    }
  }

  async isFilePinned(hash) {
    if (!this.isInitialized) {
      logger.warn('IPFS not available, returning mock pin status');
      return true;
    }

    try {
      const pins = await this.client.pin.ls();
      return pins.some(pin => pin.cid.toString() === hash);
    } catch (error) {
      logger.error(`Failed to check pin status for IPFS file: ${hash}`, error);
      return false;
    }
  }

  // Generate IPFS URL for accessing files
  getFileURL(hash) {
    const ipfsHost = process.env.IPFS_HOST || 'localhost';
    const ipfsPort = process.env.IPFS_PORT || 5001;
    const ipfsProtocol = process.env.IPFS_PROTOCOL || 'http';
    
    return `${ipfsProtocol}://${ipfsHost}:${ipfsPort}/ipfs/${hash}`;
  }

  // Generate public gateway URL (if using a public gateway)
  getPublicURL(hash) {
    const publicGateway = process.env.IPFS_PUBLIC_GATEWAY || 'https://ipfs.io/ipfs';
    return `${publicGateway}/${hash}`;
  }
}

module.exports = new IPFSService();
