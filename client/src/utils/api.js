import axios from 'axios';
import toast from 'react-hot-toast';

// Check if we're in demo mode
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

// Log environment variables for debugging
console.log('Environment variables:', {
  REACT_APP_DEMO_MODE: process.env.REACT_APP_DEMO_MODE,
  isDemoMode: isDemoMode,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo data generators
const generateDemoBatches = () => {
  const herbTypes = ['Turmeric', 'Ashwagandha', 'Brahmi', 'Neem', 'Tulsi'];
  const farmers = [
    { name: 'Rajesh Kumar', location: 'Kerala, India', logo: '🌾' },
    { name: 'Priya Sharma', location: 'Himachal Pradesh, India', logo: '🌱' },
    { name: 'Amit Patel', location: 'Madhya Pradesh, India', logo: '🌿' },
    { name: 'Sunita Devi', location: 'Uttarakhand, India', logo: '🍃' },
    { name: 'Vikram Singh', location: 'Tamil Nadu, India', logo: '🌺' }
  ];
  
  const statuses = ['harvested', 'processed', 'tested', 'certified', 'shipped'];
  
  return Array.from({ length: 20 }, (_, i) => {
    const herbType = herbTypes[i % herbTypes.length];
    const farmer = farmers[i % farmers.length];
    const status = statuses[i % statuses.length];
    
    return {
      batchId: `BATCH-${String(i + 1).padStart(4, '0')}`,
      species: herbType,
      farmer: farmer.name,
      farmerLogo: farmer.logo,
      harvestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 1000) + 100,
      status: status,
      qualityScore: Math.floor(Math.random() * 20) + 80,
      harvestLocation: {
        address: farmer.location
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: {
        overall: Math.random() > 0.1 // 90% compliance rate
      }
    };
  });
};

const generateDemoEvents = (batchId) => {
  const eventTypes = [
    { type: 'harvest', name: 'Harvest', actor: 'Farmer Rajesh', logo: '🌾' },
    { type: 'transport', name: 'Transport', actor: 'Logistics Co', logo: '🚚' },
    { type: 'processing', name: 'Processing', actor: 'Processor Ltd', logo: '⚙️' },
    { type: 'quality_test', name: 'Quality Test', actor: 'Lab Services', logo: '🔬' },
    { type: 'packaging', name: 'Packaging', actor: 'Packers Inc', logo: '📦' },
    { type: 'retail', name: 'Retail', actor: 'Ayurvedic Store', logo: '🏪' }
  ];
  
  const locations = [
    'Kerala Farm',
    'Processing Facility',
    'Quality Lab',
    'Distribution Center',
    'Retail Store'
  ];
  
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => {
    const eventType = eventTypes[i % eventTypes.length];
    const location = locations[i % locations.length];
    
    return {
      eventId: `EVENT-${String(i + 1).padStart(4, '0')}`,
      batchId: batchId || `BATCH-${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
      eventType: eventType.type,
      eventName: eventType.name,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        address: location
      },
      actorId: eventType.actor,
      actorLogo: eventType.logo,
      description: `Completed ${eventType.name.toLowerCase()} process for ${batchId || 'batch'} at ${location}`
    };
  });
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    if (response.config.metadata) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`API Request to ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          toast.error(data.error || 'Access denied');
          break;
          
        case 404:
          // Not found
          toast.error(data.error || 'Resource not found');
          break;
          
        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.msg || err.message || 'Validation error');
            });
          } else {
            toast.error(data.error || 'Validation error');
          }
          break;
          
        case 429:
          // Rate limited
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;
          
        case 503:
          // Service unavailable
          toast.error('Service temporarily unavailable. Please try again later.');
          break;
          
        default:
          toast.error(data.error || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Demo mode interceptors
if (isDemoMode) {
  console.log('Demo mode activated - overriding API methods');
  
  // Override API methods to return mock data directly
  // This is more reliable than intercepting network errors
  const originalGet = api.get;
  const originalPost = api.post;
  const originalPut = api.put;
  const originalDelete = api.delete;
  
  api.get = (url, config = {}) => {
    console.log('Demo mode GET request:', url, config);
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    // Handle different endpoints
    if (cleanUrl.includes('batches/stats')) {
      console.log('Returning mock batch stats');
      return Promise.resolve({
        data: {
          overview: {
            totalBatches: 156,
            harvested: 45,
            processed: 38,
            tested: 35,
            certified: 28,
            shipped: 10
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    if (cleanUrl.includes('events/stats')) {
      console.log('Returning mock event stats');
      // Generate daily activity data for the chart
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        };
      });
      
      return Promise.resolve({
        data: {
          overview: {
            totalEvents: 428,
            harvest: 89,
            transport: 76,
            processing: 92,
            testing: 85,
            certification: 54,
            shipment: 32
          },
          dailyActivity: dailyActivity
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    if (cleanUrl.includes('compliance/stats')) {
      console.log('Returning mock compliance stats');
      return Promise.resolve({
        data: {
          overview: {
            complianceRate: 95,
            totalViolations: 3,
            pendingReviews: 12,
            resolvedIssues: 89
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    if (cleanUrl.includes('batches') && !cleanUrl.includes('stats')) {
      console.log('Returning mock batches');
      // Handle pagination parameters
      const params = config.params || {};
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      // Generate demo batches
      const allBatches = generateDemoBatches();
      const startIndex = (page - 1) * limit;
      const paginatedBatches = allBatches.slice(startIndex, startIndex + limit);
      
      return Promise.resolve({
        data: paginatedBatches,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    if (cleanUrl.includes('events') && !cleanUrl.includes('stats')) {
      console.log('Returning mock events');
      // Handle pagination parameters
      const params = config.params || {};
      const limit = params.limit || 10;
      const page = params.page || 1;
      
      // For demo purposes, we'll generate events for a sample batch
      const sampleBatchId = 'BATCH-0001';
      const allEvents = generateDemoEvents(sampleBatchId);
      const startIndex = (page - 1) * limit;
      const paginatedEvents = allEvents.slice(startIndex, startIndex + limit);
      
      return Promise.resolve({
        data: paginatedEvents,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    // Default mock response
    console.log('Returning default mock response');
    return Promise.resolve({
      data: { message: 'Demo mode response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  };
  
  // Override POST method for demo mode
  api.post = (url, data, config = {}) => {
    console.log('Demo mode POST request:', url, data, config);
    
    // Remove leading slash if present
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    // Handle authentication endpoints
    if (cleanUrl.includes('auth/login')) {
      console.log('Returning mock login response');
      return Promise.resolve({
        data: {
          token: 'demo-jwt-token-' + Math.random().toString(36).substring(2),
          user: {
            id: 1,
            email: data.identifier || 'demo@example.com',
            name: 'Demo User',
            username: data.identifier?.split('@')[0] || 'demo',
            role: 'user',
            permissions: ['read', 'write']
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    if (cleanUrl.includes('auth/register')) {
      console.log('Returning mock register response');
      return Promise.resolve({
        data: {
          token: 'demo-jwt-token-' + Math.random().toString(36).substring(2),
          user: {
            id: Math.floor(Math.random() * 1000),
            email: data.email,
            name: data.name || data.email.split('@')[0],
            username: data.email?.split('@')[0] || 'user',
            role: 'user',
            permissions: ['read', 'write']
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      });
    }
    
    // Default mock response for other POST requests
    console.log('Returning default POST mock response');
    return Promise.resolve({
      data: { message: 'Demo mode POST response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  };
  
  // Override PUT method for demo mode
  api.put = (url, data, config = {}) => {
    console.log('Demo mode PUT request:', url, data, config);
    return Promise.resolve({
      data: { message: 'Demo mode PUT response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  };
  
  // Override DELETE method for demo mode
  api.delete = (url, config = {}) => {
    console.log('Demo mode DELETE request:', url, config);
    return Promise.resolve({
      data: { message: 'Demo mode DELETE response' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config
    });
  };
} else {
  console.log('Demo mode NOT activated - using real API calls');
}

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  logout: () => api.post('/auth/logout'),
};

export const batchesAPI = {
  getBatches: (params) => api.get('/batches', { params }),
  getBatch: (batchId) => api.get(`/batches/${batchId}`),
  createBatch: (batchData) => api.post('/batches', batchData),
  updateBatch: (batchId, batchData) => api.put(`/batches/${batchId}`, batchData),
  deleteBatch: (batchId) => api.delete(`/batches/${batchId}`),
  searchBatches: (params) => api.get('/batches/search', { params }),
  getBatchStats: () => api.get('/batches/stats'),
};

export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  addEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
  getBatchEvents: (batchId, params) => api.get(`/events/batch/${batchId}`, { params }),
  getEventStats: () => api.get('/events/stats'),
};

export const qrAPI = {
  generateQR: (batchId) => api.post('/qr/generate', { batchId }),
  scanQR: (qrData) => api.post('/qr/scan', { qrData }),
  getQRInfo: (batchId) => api.get(`/qr/batch/${batchId}`),
  validateQR: (qrData) => api.post('/qr/validate', { qrData }),
};

export const complianceAPI = {
  checkCompliance: (batchId) => api.post('/compliance/check', { batchId }),
  getViolations: (params) => api.get('/compliance/violations', { params }),
  getComplianceStats: () => api.get('/compliance/stats'),
  getComplianceReport: (batchId) => api.get(`/compliance/report/${batchId}`),
};

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deactivateUser: (userId) => api.put(`/users/${userId}/deactivate`),
  activateUser: (userId) => api.put(`/users/${userId}/activate`),
  getUserStats: () => api.get('/users/stats'),
};

export const ipfsAPI = {
  uploadFile: (formData) => api.post('/ipfs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultipleFiles: (formData) => api.post('/ipfs/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadJSON: (data) => api.post('/ipfs/upload-json', data),
  retrieveFile: (hash) => api.get(`/ipfs/retrieve/${hash}`, { responseType: 'blob' }),
  retrieveJSON: (hash) => api.get(`/ipfs/retrieve-json/${hash}`),
  getFileInfo: (hash) => api.get(`/ipfs/info/${hash}`),
  pinFile: (hash) => api.post(`/ipfs/pin/${hash}`),
  unpinFile: (hash) => api.delete(`/ipfs/pin/${hash}`),
  getFileURL: (hash) => api.get(`/ipfs/url/${hash}`),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.error || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'An unexpected error occurred';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

export default api;