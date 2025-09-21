# Ayurvedic Herb Traceability System - API Documentation

## Overview

The Ayurvedic Herb Traceability System provides a comprehensive REST API for managing blockchain-based herb supply chain tracking. The API supports role-based access control, real-time notifications, and integration with Hyperledger Fabric blockchain and IPFS storage.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "userId": "farmer001",
  "username": "john_farmer",
  "email": "john@farm.com",
  "password": "password123",
  "role": "farmer",
  "organization": "Green Valley Farms",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "userId": "farmer001",
    "username": "john_farmer",
    "email": "john@farm.com",
    "role": "farmer",
    "organization": "Green Valley Farms",
    "permissions": ["create_batch", "add_harvest_event"]
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "identifier": "john_farmer",
  "password": "password123"
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

#### PUT /auth/profile
Update user profile.

#### PUT /auth/password
Change user password.

### Batches

#### POST /batches
Create a new herb batch.

**Request Body:**
```json
{
  "batchId": "ASHWAGANDHA_2024_001",
  "species": "Ashwagandha",
  "quantity": 100,
  "unit": "kg",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Green Valley Farms, Bangalore, India",
  "metadata": {
    "harvestMethod": "Organic",
    "soilType": "Red soil"
  }
}
```

#### GET /batches
Get all herb batches with pagination and filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `species` - Filter by species
- `status` - Filter by status
- `farmerId` - Filter by farmer ID

#### GET /batches/:batchId
Get specific batch details.

#### PUT /batches/:batchId
Update batch information.

#### DELETE /batches/:batchId
Delete batch (admin only).

#### GET /batches/search
Search batches by text query.

#### GET /batches/stats
Get batch statistics (admin/regulator only).

### Events

#### POST /events
Add a new event to a batch.

**Request Body:**
```json
{
  "batchId": "ASHWAGANDHA_2024_001",
  "eventType": "harvest",
  "description": "Harvested 100kg of Ashwagandha",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "address": "Green Valley Farms, Bangalore, India",
  "qualityData": {
    "purity": 98.5,
    "moisture": 8.2
  },
  "certificates": ["cert_001.pdf"]
}
```

#### GET /events
Get all events with filtering.

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `eventType` - Filter by event type
- `actorId` - Filter by actor ID
- `startDate` - Filter by start date
- `endDate` - Filter by end date

#### GET /events/:eventId
Get specific event details.

#### GET /events/batch/:batchId
Get all events for a specific batch.

#### PUT /events/:eventId
Update event information.

#### GET /events/stats
Get event statistics (admin/regulator only).

### QR Codes

#### POST /qr/generate
Generate QR code for a batch.

**Request Body:**
```json
{
  "batchId": "ASHWAGANDHA_2024_001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "ASHWAGANDHA_2024_001",
    "qrCodeData": { ... },
    "qrCodeImage": "data:image/png;base64...",
    "qrCodeHash": "hash_value"
  }
}
```

#### POST /qr/scan
Scan and validate QR code.

**Request Body:**
```json
{
  "qrData": {
    "batchId": "ASHWAGANDHA_2024_001",
    "species": "Ashwagandha",
    "status": "packaged",
    "url": "http://localhost:3000/batch/ASHWAGANDHA_2024_001"
  }
}
```

#### GET /qr/batch/:batchId
Get QR code information for a batch.

#### POST /qr/validate
Validate QR code authenticity (public endpoint).

### Compliance

#### POST /compliance/check
Check compliance for a batch (regulator/admin only).

**Request Body:**
```json
{
  "batchId": "ASHWAGANDHA_2024_001"
}
```

#### GET /compliance/violations
Get compliance violations (regulator/admin only).

#### GET /compliance/stats
Get compliance statistics (regulator/admin only).

#### GET /compliance/report/:batchId
Get detailed compliance report (regulator/admin only).

### Users

#### GET /users
Get all users (admin/regulator only).

#### GET /users/:userId
Get specific user details.

#### PUT /users/:userId
Update user information.

#### PUT /users/:userId/deactivate
Deactivate user (admin only).

#### PUT /users/:userId/activate
Activate user (admin only).

#### GET /users/stats
Get user statistics (admin/regulator only).

### IPFS Storage

#### POST /ipfs/upload
Upload file to IPFS.

**Request:** Multipart form data with file

#### POST /ipfs/upload-multiple
Upload multiple files to IPFS.

#### POST /ipfs/upload-json
Upload JSON data to IPFS.

#### GET /ipfs/retrieve/:hash
Retrieve file from IPFS.

#### GET /ipfs/retrieve-json/:hash
Retrieve JSON data from IPFS.

#### GET /ipfs/info/:hash
Get file information from IPFS.

#### POST /ipfs/pin/:hash
Pin file in IPFS.

#### DELETE /ipfs/pin/:hash
Unpin file from IPFS.

#### GET /ipfs/url/:hash
Get file URLs (public endpoint).

## Data Models

### HerbBatch
```json
{
  "batchId": "string",
  "species": "string",
  "harvestDate": "ISO 8601 date",
  "harvestLocation": {
    "latitude": "number",
    "longitude": "number",
    "address": "string",
    "zone": "string"
  },
  "farmerId": "string",
  "quantity": "number",
  "unit": "string",
  "status": "harvested|processed|tested|packaged|in_transit|retailed",
  "events": ["HerbEvent"],
  "complianceStatus": {
    "geoFencing": "boolean",
    "seasonal": "boolean",
    "quality": "boolean",
    "species": "boolean",
    "overall": "boolean",
    "lastChecked": "ISO 8601 date",
    "violations": ["string"]
  },
  "qualityMetrics": {
    "purity": "number",
    "moisture": "number",
    "ashContent": "number",
    "heavyMetals": "object",
    "pesticides": "object",
    "microbial": "object",
    "labTested": "boolean",
    "testDate": "ISO 8601 date",
    "labId": "string",
    "certificateId": "string"
  },
  "ipfsHashes": "object",
  "qrCodeGenerated": "boolean",
  "qrCodeHash": "string",
  "metadata": "object"
}
```

### HerbEvent
```json
{
  "eventId": "string",
  "eventType": "harvest|processing|quality_test|packaging|transport|retail",
  "timestamp": "ISO 8601 date",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string",
    "zone": "string"
  },
  "actorId": "string",
  "actorRole": "string",
  "description": "string",
  "ipfsHash": "string",
  "certificates": ["string"],
  "qualityData": "object",
  "compliance": {
    "passed": "boolean",
    "rules": ["string"],
    "violations": ["string"],
    "checkedAt": "ISO 8601 date",
    "checkedBy": "string"
  },
  "metadata": "object"
}
```

### User
```json
{
  "userId": "string",
  "username": "string",
  "email": "string",
  "role": "farmer|processor|laboratory|regulator|retailer|consumer|admin",
  "organization": "string",
  "permissions": ["string"],
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "address": "object",
    "avatar": "string",
    "bio": "string"
  },
  "preferences": {
    "notifications": {
      "email": "boolean",
      "sms": "boolean",
      "push": "boolean"
    },
    "language": "string",
    "timezone": "string"
  },
  "isActive": "boolean",
  "lastLogin": "ISO 8601 date"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **File upload endpoints**: 20 requests per 15 minutes per IP

## WebSocket Events

The system supports real-time notifications via WebSocket:

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events
- `compliance_alert` - Compliance violation detected
- `batch_update` - Batch status updated
- `quality_test_result` - Quality test results available
- `qr_code_generated` - QR code generated
- `system_maintenance` - System maintenance notification

### Joining Rooms
```javascript
// Join user-specific room
socket.emit('join-room', `user_${userId}`);

// Join role-specific room
socket.emit('join-room', `role_${role}`);
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Create batch
const batch = await api.post('/batches', {
  batchId: 'ASHWAGANDHA_2024_001',
  species: 'Ashwagandha',
  quantity: 100,
  unit: 'kg',
  latitude: 12.9716,
  longitude: 77.5946,
  address: 'Green Valley Farms, Bangalore, India'
});
```

### Python
```python
import requests

headers = {'Authorization': f'Bearer {token}'}
base_url = 'http://localhost:5000/api'

# Create batch
response = requests.post(f'{base_url}/batches', json={
    'batchId': 'ASHWAGANDHA_2024_001',
    'species': 'Ashwagandha',
    'quantity': 100,
    'unit': 'kg',
    'latitude': 12.9716,
    'longitude': 77.5946,
    'address': 'Green Valley Farms, Bangalore, India'
}, headers=headers)
```

## Error Handling

Always check the response status and handle errors appropriately:

```javascript
try {
  const response = await api.post('/batches', batchData);
  if (response.data.success) {
    // Handle success
    console.log(response.data.data);
  } else {
    // Handle API error
    console.error(response.data.error);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error.message);
}
```

## Testing

Use the provided test suite to verify API functionality:

```bash
# Run comprehensive tests
node tests/test-cases.js

# Run demonstration
node tests/demo.js
```

## Support

For API support and questions:
- Email: support@ayurvedic-herbs.com
- Documentation: https://docs.ayurvedic-herbs.com
- GitHub: https://github.com/ayurvedic-herbs/traceability-system
