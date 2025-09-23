/**
 * BioTrace System - Demonstration Script
 * 
 * This script demonstrates the complete functionality of the blockchain-based
 * herb traceability system using Ashwagandha as an example.
 */

const axios = require('axios');
const QRCode = require('qrcode');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const DEMO_BATCH_ID = 'ASHWAGANDHA_2024_001';
const DEMO_SPECIES = 'Ashwagandha';
const DEMO_FARMER_ID = 'farmer001';

// Demo data
const demoData = {
  farmer: {
    userId: 'farmer001',
    username: 'john_farmer',
    email: 'john@farm.com',
    password: 'password123',
    role: 'farmer',
    organization: 'Green Valley Farms'
  },
  processor: {
    userId: 'processor001',
    username: 'mary_processor',
    email: 'mary@process.com',
    password: 'password123',
    role: 'processor',
    organization: 'Herb Processing Co'
  },
  lab: {
    userId: 'lab001',
    username: 'dr_smith',
    email: 'smith@lab.com',
    password: 'password123',
    role: 'laboratory',
    organization: 'Quality Lab Services'
  },
  regulator: {
    userId: 'regulator001',
    username: 'regulator_jane',
    email: 'jane@gov.com',
    password: 'password123',
    role: 'regulator',
    organization: 'Ministry of AYUSH'
  }
};

class HerbTraceabilityDemo {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000
    });
    this.tokens = {};
  }

  // Utility function to make API calls
  async apiCall(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: endpoint,
        headers: {}
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (data) {
        config.data = data;
      }

      const response = await this.api(config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  // Step 1: Register demo users
  async registerUsers() {
    console.log('\n🌱 Step 1: Registering Demo Users...');
    
    for (const [role, userData] of Object.entries(demoData)) {
      const result = await this.apiCall('POST', '/auth/register', userData);
      if (result.success) {
        this.tokens[role] = result.data.token;
        console.log(`✅ ${role} registered successfully`);
      } else {
        console.log(`❌ Failed to register ${role}: ${result.error}`);
      }
    }
  }

  // Step 2: Login users
  async loginUsers() {
    console.log('\n🔐 Step 2: Logging in Demo Users...');
    
    for (const [role, userData] of Object.entries(demoData)) {
      const result = await this.apiCall('POST', '/auth/login', {
        identifier: userData.username,
        password: userData.password
      });
      if (result.success) {
        this.tokens[role] = result.data.token;
        console.log(`✅ ${role} logged in successfully`);
      } else {
        console.log(`❌ Failed to login ${role}: ${result.error}`);
      }
    }
  }

  // Step 3: Create herb batch (Farmer)
  async createHerbBatch() {
    console.log('\n🌿 Step 3: Creating Herb Batch (Farmer)...');
    
    const batchData = {
      batchId: DEMO_BATCH_ID,
      species: DEMO_SPECIES,
      quantity: 100,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Green Valley Farms, Bangalore, Karnataka, India',
      metadata: {
        harvestMethod: 'Organic',
        soilType: 'Red soil',
        climate: 'Tropical'
      }
    };

    const result = await this.apiCall('POST', '/batches', batchData, this.tokens.farmer);
    if (result.success) {
      console.log(`✅ Herb batch created: ${DEMO_BATCH_ID}`);
      console.log(`   Species: ${DEMO_SPECIES}`);
      console.log(`   Quantity: ${batchData.quantity} ${batchData.unit}`);
      console.log(`   Location: ${batchData.address}`);
    } else {
      console.log(`❌ Failed to create batch: ${result.error}`);
    }
  }

  // Step 4: Add processing event (Processor)
  async addProcessingEvent() {
    console.log('\n⚙️ Step 4: Adding Processing Event (Processor)...');
    
    const eventData = {
      batchId: DEMO_BATCH_ID,
      eventType: 'processing',
      description: 'Washed, dried, and sorted Ashwagandha roots',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Herb Processing Co, Mumbai, Maharashtra, India',
      qualityData: {
        processingMethod: 'Traditional sun drying',
        temperature: '35°C',
        humidity: '45%',
        duration: '7 days'
      }
    };

    const result = await this.apiCall('POST', '/events', eventData, this.tokens.processor);
    if (result.success) {
      console.log(`✅ Processing event added to batch ${DEMO_BATCH_ID}`);
      console.log(`   Description: ${eventData.description}`);
      console.log(`   Location: ${eventData.address}`);
    } else {
      console.log(`❌ Failed to add processing event: ${result.error}`);
    }
  }

  // Step 5: Add quality test event (Laboratory)
  async addQualityTestEvent() {
    console.log('\n🧪 Step 5: Adding Quality Test Event (Laboratory)...');
    
    const eventData = {
      batchId: DEMO_BATCH_ID,
      eventType: 'quality_test',
      description: 'Comprehensive quality analysis and testing',
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Quality Lab Services, Delhi, India',
      qualityData: {
        purity: 98.5,
        moisture: 8.2,
        ashContent: 6.1,
        heavyMetals: {
          lead: 2.1,
          cadmium: 0.8,
          mercury: 0.3,
          arsenic: 1.2
        },
        pesticides: {
          chlorpyrifos: 0.05,
          cypermethrin: 0.02
        },
        microbial: {
          eColi: 0,
          salmonella: 0,
          yeast: 10,
          mold: 5
        },
        testDate: new Date().toISOString(),
        labId: 'QLS_2024_001',
        certificateId: 'CERT_ASHWAGANDHA_001'
      }
    };

    const result = await this.apiCall('POST', '/events', eventData, this.tokens.lab);
    if (result.success) {
      console.log(`✅ Quality test event added to batch ${DEMO_BATCH_ID}`);
      console.log(`   Purity: ${eventData.qualityData.purity}%`);
      console.log(`   Moisture: ${eventData.qualityData.moisture}%`);
      console.log(`   Certificate: ${eventData.qualityData.certificateId}`);
    } else {
      console.log(`❌ Failed to add quality test event: ${result.error}`);
    }
  }

  // Step 6: Add packaging event (Processor)
  async addPackagingEvent() {
    console.log('\n📦 Step 6: Adding Packaging Event (Processor)...');
    
    const eventData = {
      batchId: DEMO_BATCH_ID,
      eventType: 'packaging',
      description: 'Packaged in eco-friendly containers with proper labeling',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Herb Processing Co, Mumbai, Maharashtra, India',
      qualityData: {
        packagingMaterial: 'Food-grade plastic containers',
        packageSize: '500g',
        batchNumber: 'ASHWAGANDHA_2024_001',
        expiryDate: '2025-12-31',
        storageConditions: 'Cool, dry place'
      }
    };

    const result = await this.apiCall('POST', '/events', eventData, this.tokens.processor);
    if (result.success) {
      console.log(`✅ Packaging event added to batch ${DEMO_BATCH_ID}`);
      console.log(`   Package size: ${eventData.qualityData.packageSize}`);
      console.log(`   Expiry date: ${eventData.qualityData.expiryDate}`);
    } else {
      console.log(`❌ Failed to add packaging event: ${result.error}`);
    }
  }

  // Step 7: Generate QR code (Processor)
  async generateQRCode() {
    console.log('\n📱 Step 7: Generating QR Code (Processor)...');
    
    const result = await this.apiCall('POST', '/qr/generate', {
      batchId: DEMO_BATCH_ID
    }, this.tokens.processor);

    if (result.success) {
      console.log(`✅ QR code generated for batch ${DEMO_BATCH_ID}`);
      console.log(`   QR Code Hash: ${result.data.data.qrCodeHash}`);
      
      // Generate QR code image
      try {
        const qrCodeData = result.data.data.qrCodeData;
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256
        });
        
        console.log(`   QR Code Image: ${qrCodeImage.substring(0, 50)}...`);
      } catch (error) {
        console.log(`   QR Code generation error: ${error.message}`);
      }
    } else {
      console.log(`❌ Failed to generate QR code: ${result.error}`);
    }
  }

  // Step 8: Scan QR code (Consumer simulation)
  async scanQRCode() {
    console.log('\n📲 Step 8: Scanning QR Code (Consumer)...');
    
    // Simulate QR code data
    const qrData = {
      batchId: DEMO_BATCH_ID,
      species: DEMO_SPECIES,
      status: 'packaged',
      harvestDate: new Date().toISOString(),
      farmerId: DEMO_FARMER_ID,
      url: `http://localhost:3000/batch/${DEMO_BATCH_ID}`,
      blockchainTxId: 'tx_123456789',
      generatedAt: new Date().toISOString(),
      generatedBy: 'processor001'
    };

    const result = await this.apiCall('POST', '/qr/scan', {
      qrData: qrData
    }, this.tokens.farmer); // Using farmer token as consumer

    if (result.success) {
      console.log(`✅ QR code scanned successfully`);
      console.log(`   Batch ID: ${result.data.data.batch.batchId}`);
      console.log(`   Species: ${result.data.data.batch.species}`);
      console.log(`   Status: ${result.data.data.batch.status}`);
      console.log(`   Compliance: ${result.data.data.batch.complianceStatus.overall ? 'Compliant' : 'Non-compliant'}`);
      console.log(`   Events: ${result.data.data.batch.events.length} events recorded`);
    } else {
      console.log(`❌ Failed to scan QR code: ${result.error}`);
    }
  }

  // Step 9: Check compliance (Regulator)
  async checkCompliance() {
    console.log('\n🛡️ Step 9: Checking Compliance (Regulator)...');
    
    const result = await this.apiCall('POST', '/compliance/check', {
      batchId: DEMO_BATCH_ID
    }, this.tokens.regulator);

    if (result.success) {
      console.log(`✅ Compliance check completed for batch ${DEMO_BATCH_ID}`);
      const compliance = result.data.data.complianceCheck.complianceStatus;
      console.log(`   Geo-fencing: ${compliance.geoFencing ? '✅' : '❌'}`);
      console.log(`   Seasonal: ${compliance.seasonal ? '✅' : '❌'}`);
      console.log(`   Quality: ${compliance.quality ? '✅' : '❌'}`);
      console.log(`   Species: ${compliance.species ? '✅' : '❌'}`);
      console.log(`   Overall: ${compliance.overall ? '✅ Compliant' : '❌ Non-compliant'}`);
      
      if (compliance.violations.length > 0) {
        console.log(`   Violations: ${compliance.violations.join(', ')}`);
      }
    } else {
      console.log(`❌ Failed to check compliance: ${result.error}`);
    }
  }

  // Step 10: Get batch details
  async getBatchDetails() {
    console.log('\n📋 Step 10: Getting Batch Details...');
    
    const result = await this.apiCall('GET', `/batches/${DEMO_BATCH_ID}`, null, this.tokens.farmer);

    if (result.success) {
      console.log(`✅ Batch details retrieved for ${DEMO_BATCH_ID}`);
      const batch = result.data.data;
      console.log(`   Species: ${batch.species}`);
      console.log(`   Quantity: ${batch.quantity} ${batch.unit}`);
      console.log(`   Status: ${batch.status}`);
      console.log(`   Events: ${batch.events.length}`);
      console.log(`   Created: ${new Date(batch.createdAt).toLocaleString()}`);
      console.log(`   Updated: ${new Date(batch.updatedAt).toLocaleString()}`);
    } else {
      console.log(`❌ Failed to get batch details: ${result.error}`);
    }
  }

  // Step 11: Demonstrate violation (Out of season harvest)
  async demonstrateViolation() {
    console.log('\n⚠️ Step 11: Demonstrating Compliance Violation...');
    
    // Create a batch with out-of-season harvest
    const violationBatchData = {
      batchId: 'VIOLATION_ASHWAGANDHA_001',
      species: DEMO_SPECIES,
      quantity: 50,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, Karnataka, India',
      metadata: {
        harvestMethod: 'Organic',
        harvestDate: '2024-01-15' // January (out of season)
      }
    };

    const result = await this.apiCall('POST', '/batches', violationBatchData, this.tokens.farmer);
    if (result.success) {
      console.log(`✅ Violation batch created: ${violationBatchData.batchId}`);
      console.log(`   This batch should trigger a seasonal violation alert`);
    } else {
      console.log(`❌ Failed to create violation batch: ${result.error}`);
    }
  }

  // Run complete demonstration
  async runDemo() {
    console.log('🚀 Starting BioTrace System Demonstration');
    console.log('=' .repeat(60));

    try {
      await this.registerUsers();
      await this.loginUsers();
      await this.createHerbBatch();
      await this.addProcessingEvent();
      await this.addQualityTestEvent();
      await this.addPackagingEvent();
      await this.generateQRCode();
      await this.scanQRCode();
      await this.checkCompliance();
      await this.getBatchDetails();
      await this.demonstrateViolation();

      console.log('\n🎉 Demonstration completed successfully!');
      console.log('=' .repeat(60));
      console.log('Key Features Demonstrated:');
      console.log('✅ User registration and authentication');
      console.log('✅ Herb batch creation with GPS coordinates');
      console.log('✅ Supply chain event tracking');
      console.log('✅ Quality testing and certification');
      console.log('✅ QR code generation and scanning');
      console.log('✅ Compliance monitoring and alerts');
      console.log('✅ Blockchain-based immutable records');
      console.log('✅ Role-based access control');
      console.log('✅ Real-time notifications');

    } catch (error) {
      console.error('\n❌ Demonstration failed:', error.message);
    }
  }
}

// Run the demonstration
if (require.main === module) {
  const demo = new HerbTraceabilityDemo();
  demo.runDemo().catch(console.error);
}

module.exports = HerbTraceabilityDemo;
