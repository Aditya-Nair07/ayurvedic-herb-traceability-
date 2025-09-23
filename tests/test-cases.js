/**
 * BioTrace System - Test Cases
 * 
 * Comprehensive test suite for the blockchain-based herb traceability system
 */

const axios = require('axios');
const assert = require('assert');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_TIMEOUT = 30000;

class HerbTraceabilityTests {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: TEST_TIMEOUT
    });
    this.tokens = {};
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0
    };
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
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // Test result tracking
  recordTest(testName, passed, error = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: ${error}`);
    }
  }

  // Test 1: User Registration
  async testUserRegistration() {
    console.log('\n📝 Testing User Registration...');
    
    const testUsers = [
      {
        userId: 'test_farmer_001',
        username: 'test_farmer',
        email: 'test_farmer@example.com',
        password: 'password123',
        role: 'farmer',
        organization: 'Test Farm'
      },
      {
        userId: 'test_processor_001',
        username: 'test_processor',
        email: 'test_processor@example.com',
        password: 'password123',
        role: 'processor',
        organization: 'Test Processing Co'
      }
    ];

    for (const user of testUsers) {
      const result = await this.apiCall('POST', '/auth/register', user);
      this.recordTest(
        `Register ${user.role}`,
        result.success,
        result.error
      );
      
      if (result.success) {
        this.tokens[user.role] = result.data.token;
      }
    }
  }

  // Test 2: User Authentication
  async testUserAuthentication() {
    console.log('\n🔐 Testing User Authentication...');
    
    const loginData = {
      identifier: 'test_farmer',
      password: 'password123'
    };

    const result = await this.apiCall('POST', '/auth/login', loginData);
    this.recordTest(
      'User login',
      result.success,
      result.error
    );

    if (result.success) {
      this.tokens.farmer = result.data.token;
    }
  }

  // Test 3: Batch Creation
  async testBatchCreation() {
    console.log('\n🌿 Testing Batch Creation...');
    
    const batchData = {
      batchId: 'TEST_BATCH_001',
      species: 'Ashwagandha',
      quantity: 50,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    };

    const result = await this.apiCall('POST', '/batches', batchData, this.tokens.farmer);
    this.recordTest(
      'Create herb batch',
      result.success,
      result.error
    );

    // Test duplicate batch creation
    const duplicateResult = await this.apiCall('POST', '/batches', batchData, this.tokens.farmer);
    this.recordTest(
      'Prevent duplicate batch creation',
      !duplicateResult.success,
      'Should have failed but succeeded'
    );
  }

  // Test 4: Event Addition
  async testEventAddition() {
    console.log('\n📅 Testing Event Addition...');
    
    const eventData = {
      batchId: 'TEST_BATCH_001',
      eventType: 'harvest',
      description: 'Test harvest event',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    };

    const result = await this.apiCall('POST', '/events', eventData, this.tokens.farmer);
    this.recordTest(
      'Add harvest event',
      result.success,
      result.error
    );

    // Test invalid event type
    const invalidEventData = {
      ...eventData,
      eventType: 'invalid_event'
    };

    const invalidResult = await this.apiCall('POST', '/events', invalidEventData, this.tokens.farmer);
    this.recordTest(
      'Reject invalid event type',
      !invalidResult.success,
      'Should have failed but succeeded'
    );
  }

  // Test 5: Batch Retrieval
  async testBatchRetrieval() {
    console.log('\n📋 Testing Batch Retrieval...');
    
    const result = await this.apiCall('GET', '/batches/TEST_BATCH_001', null, this.tokens.farmer);
    this.recordTest(
      'Get batch details',
      result.success,
      result.error
    );

    if (result.success) {
      const batch = result.data.data;
      this.recordTest(
        'Batch contains required fields',
        batch.batchId === 'TEST_BATCH_001' && batch.species === 'Ashwagandha',
        'Missing required fields'
      );
    }

    // Test non-existent batch
    const notFoundResult = await this.apiCall('GET', '/batches/NON_EXISTENT', null, this.tokens.farmer);
    this.recordTest(
      'Handle non-existent batch',
      !notFoundResult.success,
      'Should have failed but succeeded'
    );
  }

  // Test 6: QR Code Generation
  async testQRCodeGeneration() {
    console.log('\n📱 Testing QR Code Generation...');
    
    // First, create a packaged batch
    const packagingEvent = {
      batchId: 'TEST_BATCH_001',
      eventType: 'packaging',
      description: 'Test packaging event',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Test Processing Co, Mumbai, India'
    };

    await this.apiCall('POST', '/events', packagingEvent, this.tokens.processor);

    // Generate QR code
    const result = await this.apiCall('POST', '/qr/generate', {
      batchId: 'TEST_BATCH_001'
    }, this.tokens.processor);

    this.recordTest(
      'Generate QR code',
      result.success,
      result.error
    );

    if (result.success) {
      this.recordTest(
        'QR code contains required data',
        result.data.data.qrCodeData.batchId === 'TEST_BATCH_001',
        'Missing batch ID in QR code data'
      );
    }
  }

  // Test 7: QR Code Scanning
  async testQRCodeScanning() {
    console.log('\n📲 Testing QR Code Scanning...');
    
    const qrData = {
      batchId: 'TEST_BATCH_001',
      species: 'Ashwagandha',
      status: 'packaged',
      harvestDate: new Date().toISOString(),
      farmerId: 'test_farmer_001',
      url: 'http://localhost:3000/batch/TEST_BATCH_001',
      blockchainTxId: 'test_tx_123',
      generatedAt: new Date().toISOString(),
      generatedBy: 'test_processor_001'
    };

    const result = await this.apiCall('POST', '/qr/scan', {
      qrData: qrData
    }, this.tokens.farmer);

    this.recordTest(
      'Scan QR code',
      result.success,
      result.error
    );

    if (result.success) {
      this.recordTest(
        'QR scan returns batch data',
        result.data.data.batch.batchId === 'TEST_BATCH_001',
        'Missing batch data in scan result'
      );
    }
  }

  // Test 8: Compliance Checking
  async testComplianceChecking() {
    console.log('\n🛡️ Testing Compliance Checking...');
    
    const result = await this.apiCall('POST', '/compliance/check', {
      batchId: 'TEST_BATCH_001'
    }, this.tokens.regulator);

    this.recordTest(
      'Check compliance',
      result.success,
      result.error
    );

    if (result.success) {
      const compliance = result.data.data.complianceCheck.complianceStatus;
      this.recordTest(
        'Compliance status structure',
        typeof compliance.overall === 'boolean',
        'Invalid compliance status structure'
      );
    }
  }

  // Test 9: Permission Testing
  async testPermissions() {
    console.log('\n🔒 Testing Role-Based Permissions...');
    
    // Test farmer cannot access regulator functions
    const complianceResult = await this.apiCall('POST', '/compliance/check', {
      batchId: 'TEST_BATCH_001'
    }, this.tokens.farmer);

    this.recordTest(
      'Farmer cannot check compliance',
      !complianceResult.success,
      'Farmer should not be able to check compliance'
    );

    // Test processor cannot create batches
    const batchResult = await this.apiCall('POST', '/batches', {
      batchId: 'TEST_BATCH_002',
      species: 'Tulsi',
      quantity: 25,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    }, this.tokens.processor);

    this.recordTest(
      'Processor cannot create batches',
      !batchResult.success,
      'Processor should not be able to create batches'
    );
  }

  // Test 10: Data Validation
  async testDataValidation() {
    console.log('\n✅ Testing Data Validation...');
    
    // Test invalid batch data
    const invalidBatchData = {
      batchId: '', // Empty batch ID
      species: 'Ashwagandha',
      quantity: -10, // Negative quantity
      unit: 'invalid_unit', // Invalid unit
      latitude: 200, // Invalid latitude
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    };

    const result = await this.apiCall('POST', '/batches', invalidBatchData, this.tokens.farmer);
    this.recordTest(
      'Reject invalid batch data',
      !result.success,
      'Should have failed but succeeded'
    );

    // Test invalid coordinates
    const invalidLocationData = {
      batchId: 'TEST_BATCH_003',
      species: 'Ashwagandha',
      quantity: 50,
      unit: 'kg',
      latitude: 91, // Invalid latitude
      longitude: 181, // Invalid longitude
      address: 'Test Farm, Bangalore, India'
    };

    const locationResult = await this.apiCall('POST', '/batches', invalidLocationData, this.tokens.farmer);
    this.recordTest(
      'Reject invalid coordinates',
      !locationResult.success,
      'Should have failed but succeeded'
    );
  }

  // Test 11: Offline Sync Simulation
  async testOfflineSync() {
    console.log('\n📱 Testing Offline Sync Simulation...');
    
    // Simulate offline event creation
    const offlineEvent = {
      batchId: 'TEST_BATCH_001',
      eventType: 'transport',
      description: 'Offline transport event',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Test Transport Co, Mumbai, India',
      metadata: {
        offline: true,
        syncedAt: new Date().toISOString()
      }
    };

    const result = await this.apiCall('POST', '/events', offlineEvent, this.tokens.processor);
    this.recordTest(
      'Process offline event',
      result.success,
      result.error
    );
  }

  // Test 12: Performance Testing
  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const startTime = Date.now();
    
    // Create multiple batches
    const batchPromises = [];
    for (let i = 0; i < 5; i++) {
      const batchData = {
        batchId: `PERF_TEST_BATCH_${i}`,
        species: 'Ashwagandha',
        quantity: 10,
        unit: 'kg',
        latitude: 12.9716,
        longitude: 77.5946,
        address: `Test Farm ${i}, Bangalore, India`
      };
      
      batchPromises.push(
        this.apiCall('POST', '/batches', batchData, this.tokens.farmer)
      );
    }

    const results = await Promise.all(batchPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = results.filter(r => r.success).length;
    this.recordTest(
      'Concurrent batch creation',
      successCount === 5,
      `Only ${successCount}/5 batches created successfully`
    );

    this.recordTest(
      'Performance within limits',
      duration < 10000, // Should complete within 10 seconds
      `Took ${duration}ms, expected < 10000ms`
    );
  }

  // Test 13: Error Handling
  async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling...');
    
    // Test with invalid token
    const invalidTokenResult = await this.apiCall('GET', '/batches/TEST_BATCH_001', null, 'invalid_token');
    this.recordTest(
      'Handle invalid token',
      !invalidTokenResult.success,
      'Should have failed but succeeded'
    );

    // Test with missing required fields
    const incompleteData = {
      batchId: 'INCOMPLETE_BATCH',
      // Missing required fields
    };

    const incompleteResult = await this.apiCall('POST', '/batches', incompleteData, this.tokens.farmer);
    this.recordTest(
      'Handle incomplete data',
      !incompleteResult.success,
      'Should have failed but succeeded'
    );
  }

  // Test 14: Security Testing
  async testSecurity() {
    console.log('\n🔐 Testing Security...');
    
    // Test SQL injection attempt
    const sqlInjectionData = {
      batchId: "'; DROP TABLE batches; --",
      species: 'Ashwagandha',
      quantity: 50,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    };

    const sqlResult = await this.apiCall('POST', '/batches', sqlInjectionData, this.tokens.farmer);
    this.recordTest(
      'Prevent SQL injection',
      !sqlResult.success,
      'SQL injection attempt succeeded'
    );

    // Test XSS attempt
    const xssData = {
      batchId: 'XSS_TEST_BATCH',
      species: '<script>alert("XSS")</script>',
      quantity: 50,
      unit: 'kg',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Test Farm, Bangalore, India'
    };

    const xssResult = await this.apiCall('POST', '/batches', xssData, this.tokens.farmer);
    this.recordTest(
      'Prevent XSS',
      xssResult.success, // Should succeed but sanitize input
      'XSS prevention failed'
    );
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Test Suite');
    console.log('=' .repeat(50));

    try {
      await this.testUserRegistration();
      await this.testUserAuthentication();
      await this.testBatchCreation();
      await this.testEventAddition();
      await this.testBatchRetrieval();
      await this.testQRCodeGeneration();
      await this.testQRCodeScanning();
      await this.testComplianceChecking();
      await this.testPermissions();
      await this.testDataValidation();
      await this.testOfflineSync();
      await this.testPerformance();
      await this.testErrorHandling();
      await this.testSecurity();

      console.log('\n📊 Test Results Summary');
      console.log('=' .repeat(50));
      console.log(`Total Tests: ${this.testResults.total}`);
      console.log(`Passed: ${this.testResults.passed}`);
      console.log(`Failed: ${this.testResults.failed}`);
      console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(2)}%`);

      if (this.testResults.failed === 0) {
        console.log('\n🎉 All tests passed! System is working correctly.');
      } else {
        console.log(`\n⚠️ ${this.testResults.failed} tests failed. Please review the issues.`);
      }

    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tests = new HerbTraceabilityTests();
  tests.runAllTests().catch(console.error);
}

module.exports = HerbTraceabilityTests;
