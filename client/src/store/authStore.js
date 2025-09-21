import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Check if we're in demo mode
const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

// Demo users
const demoUsers = {
  'john@farm.com': { password: 'password123', role: 'farmer', name: 'John Farmer' },
  'mary@process.com': { password: 'password123', role: 'processor', name: 'Mary Processor' },
  'smith@lab.com': { password: 'password123', role: 'laboratory', name: 'Smith Laboratory' },
  'jane@gov.com': { password: 'password123', role: 'regulator', name: 'Jane Regulator' }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Login
      login: async (credentials) => {
        // Handle demo mode
        if (isDemoMode) {
          set({ isLoading: true, error: null });
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { identifier, password } = credentials;
          
          // Check if user exists in demo users
          if (demoUsers[identifier] && demoUsers[identifier].password === password) {
            const user = {
              id: Math.floor(Math.random() * 1000),
              email: identifier,
              name: demoUsers[identifier].name,
              role: demoUsers[identifier].role,
              permissions: ['read', 'write']
            };
            
            const token = 'demo-jwt-token-' + Math.random().toString(36).substring(2);
            
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            
            // Store token in localStorage
            localStorage.setItem('token', token);
            
            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return { success: true };
          } else {
            const errorMessage = 'Invalid credentials';
            set({ 
              error: errorMessage, 
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null
            });
            return { success: false, error: errorMessage };
          }
        }
        
        // Regular API login
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', credentials);
          const { token, user } = response.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          console.error('Error response:', error.response?.data);
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          return { success: false, error: errorMessage };
        }
      },

      // Register
      register: async (userData) => {
        // Handle demo mode
        if (isDemoMode) {
          set({ isLoading: true, error: null });
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create demo user
          const user = {
            id: Math.floor(Math.random() * 1000),
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            role: 'user',
            permissions: ['read', 'write']
          };
          
          const token = 'demo-jwt-token-' + Math.random().toString(36).substring(2);
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        }
        
        // Regular API register
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        });
        
        // Remove token from localStorage
        localStorage.removeItem('token');
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization'];
        
        // Clear localStorage
        localStorage.removeItem('auth-storage');
      },

      // Update profile
      updateProfile: async (profileData) => {
        // Handle demo mode
        if (isDemoMode) {
          set({ isLoading: true, error: null });
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { user } = get();
          const updatedUser = { ...user, ...profileData };
          
          set({ 
            user: updatedUser, 
            isLoading: false,
            error: null 
          });
          
          return { success: true };
        }
        
        // Regular API update profile
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/auth/profile', profileData);
          const { user } = response.data;
          
          set({ 
            user: { ...get().user, ...user }, 
            isLoading: false,
            error: null 
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          set({ 
            error: errorMessage, 
            isLoading: false
          });
          return { success: false, error: errorMessage };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        // Handle demo mode
        if (isDemoMode) {
          set({ isLoading: true, error: null });
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            isLoading: false,
            error: null 
          });
          
          return { success: true };
        }
        
        // Regular API change password
        set({ isLoading: true, error: null });
        try {
          await api.put('/auth/password', passwordData);
          
          set({ 
            isLoading: false,
            error: null 
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Password change failed';
          set({ 
            error: errorMessage, 
            isLoading: false
          });
          return { success: false, error: errorMessage };
        }
      },

      // Initialize auth (check if user is already logged in)
      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          // Handle demo mode
          if (isDemoMode) {
            set({ isLoading: true });
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // For demo mode, just verify the token format
            if (token.startsWith('demo-jwt-token-')) {
              // Create a demo user
              const user = {
                id: Math.floor(Math.random() * 1000),
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'user',
                permissions: ['read', 'write']
              };
              
              set({ 
                user, 
                token, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              });
            } else {
              // Invalid token, clear auth state
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false, 
                isLoading: false,
                error: null 
              });
              
              // Clear localStorage
              localStorage.removeItem('auth-storage');
            }
            return;
          }
          
          // Regular API initialization
          set({ isLoading: true });
          try {
            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Verify token and get user data
            const response = await api.get('/auth/me');
            const { user } = response.data;
            
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch (error) {
            // Token is invalid, clear auth state
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
            
            // Remove token from API headers
            delete api.defaults.headers.common['Authorization'];
            
            // Clear localStorage
            localStorage.removeItem('auth-storage');
          }
        } else {
          set({ isLoading: false });
        }
      },

      // Check if user has permission
      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role || user?.role === 'admin';
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;