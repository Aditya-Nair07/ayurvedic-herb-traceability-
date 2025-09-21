import axios from 'axios';
import toast from 'react-hot-toast';

// Check if we're in demo mode
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

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
  return Array.from({ length: 20 }, (_, i) => ({
    id: `batch-${i + 1}`,
    herbType: ['Turmeric', 'Ashwagandha', 'Brahmi', 'Neem', 'Tulsi'][i % 5],
    farmer: `Farmer ${String.fromCharCode(65 + (i % 26))}`,
    harvestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: Math.floor(Math.random() * 1000) + 100,
    status: ['harvested', 'processed', 'tested', 'certified', 'shipped'][i % 5],
    qualityScore: Math.floor(Math.random() * 20) + 80,
    location: `${Math.floor(Math.random() * 10 + 10)}.${Math.floor(Math.random() * 90)}, ${Math.floor(Math.random() * 10 + 70)}.${Math.floor(Math.random() * 90)}`
  }));
};

const generateDemoEvents = (batchId) => {
  const eventTypes = ['Harvest', 'Transport', 'Processing', 'Quality Test', 'Certification', 'Shipment'];
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
    id: `event-${batchId}-${i + 1}`,
    batchId,
    type: eventTypes[i % eventTypes.length],
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: `${Math.floor(Math.random() * 10 + 10)}.${Math.floor(Math.random() * 90)}, ${Math.floor(Math.random() * 10 + 70)}.${Math.floor(Math.random() * 90)}`,
    actor: `Actor ${String.fromCharCode(65 + (i % 26))}`,
    details: `Event details for ${eventTypes[i % eventTypes.length]}`
  }));
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
  // Intercept requests and provide mock responses
  api.interceptors.request.use(
    (config) => {
      // Store the original request for reference
      config.isDemoRequest = true;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // If it's a network error and we're in demo mode, provide mock data
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const { config } = error;
        const url = config.url;
        
        // Mock responses based on URL
        if (url.includes('/auth/login')) {
          return Promise.resolve({
            data: {
              token: 'demo-jwt-token-' + Math.random().toString(36).substring(2),
              user: {
                id: 1,
                email: 'demo@example.com',
                name: 'Demo User',
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
        
        if (url.includes('/auth/register')) {
          return Promise.resolve({
            data: {
              token: 'demo-jwt-token-' + Math.random().toString(36).substring(2),
              user: {
                id: Math.floor(Math.random() * 1000),
                email: config.data.email,
                name: config.data.name || config.data.email.split('@')[0],
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
        
        if (url.includes('/auth/me')) {
          return Promise.resolve({
            data: {
              user: {
                id: 1,
                email: 'demo@example.com',
                name: 'Demo User',
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
        
        if (url.includes('/batches')) {
          if (url.includes('/stats')) {
            return Promise.resolve({
              data: {
                total: 156,
                harvested: 45,
                processed: 38,
                tested: 35,
                certified: 28,
                shipped: 10
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            });
          }
          
          return Promise.resolve({
            data: generateDemoBatches(),
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          });
        }
        
        if (url.includes('/events')) {
          if (url.includes('/stats')) {
            return Promise.resolve({
              data: {
                total: 428,
                harvest: 89,
                transport: 76,
                processing: 92,
                testing: 85,
                certification: 54,
                shipment: 32
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            });
          }
          
          const batchId = url.split('/').pop();
          return Promise.resolve({
            data: generateDemoEvents(batchId),
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          });
        }
        
        // Default mock response
        return Promise.resolve({
          data: { message: 'Demo mode response' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }
      
      return Promise.reject(error);
    }
  );
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