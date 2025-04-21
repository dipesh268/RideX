
import axios from 'axios';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

// Create socket.io connection
const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const socket = io(socketUrl, {
  autoConnect: false,
  reconnection: true
});

// Create an axios instance
const api = axios.create({
  baseURL: `${socketUrl}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Connection state
let isConnected = false;
let connectionListeners = [];

// Add a request interceptor for adding auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    if (error.response?.status === 401) {
      // Handle authentication errors
      const message = error.response?.data?.message || 'Authentication failed. Please log in again.';
      alert(message);
      
      // If token is invalid or expired, clear it
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
      }
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      // Connection issues
      updateConnectionState(false);
    } else {
      // Handle other errors
      const message = error.response?.data?.message || 'An error occurred';
      alert(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  updateUser: (userData) => api.put('/auth/update-user', userData),
};

// User API
export const userAPI = {
  updateLocation: (location) => api.patch('/users/location', location),
  toggleOnlineStatus: (isOnline) => api.patch('/users/status', { isOnline }),
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updateVehicleDetails: (payload) => api.post('/users/vehicle_details', payload),
  getVehicleDetails: () => api.get('/users/vehicle_details'),
};

// Rides API
export const ridesAPI = {
  requestRide: (rideData) => api.post('/rides/request', rideData),
  getAvailableRides: (vehicleType) => api.get(`/rides/available${vehicleType ? `?vehicleType=${vehicleType}` : ''}`),
  getScheduledRides: () => api.get('/rides/scheduled'),
  getRideHistory: () => api.get('/rides/history'),
  getRideById: (rideId) => api.get(`/rides/${rideId}`),
  acceptRide: (rideId) => api.patch(`/rides/${rideId}/accept`),
  startRide: (rideId) => api.patch(`/rides/${rideId}/start`),
  completeRide: (rideId) => api.patch(`/rides/${rideId}/complete`),
  cancelRide: (rideId) => api.patch(`/rides/${rideId}/cancel`),
  rejectRide: (rideId) => api.patch(`/rides/${rideId}/reject`),
};

// Connection checking
export const connectionAPI = {
  // Modified to handle connection failures gracefully
  checkHealth: () => {
    return api.get('/health')
      .then(response => {
        updateConnectionState(true);
        return response;
      })
      .catch(error => {
        // Only update connection state for network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
          updateConnectionState(false);
        } else if (error.response?.status === 404) {
          // If the health endpoint doesn't exist yet but server responded, still consider connected
          updateConnectionState(true);
        }
        return Promise.reject(error);
      });
  }
};

export function checkConnection() {
  return connectionAPI.checkHealth()
    .then(() => true)
    .catch(() => false);
}

// Connection state management
export function updateConnectionState(connected) {
  if (isConnected !== connected) {
    isConnected = connected;
    // Notify all listeners
    connectionListeners.forEach(listener => listener(connected));
  }
}

// Subscribe to connection changes
export function subscribeToConnection(callback) {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter(listener => listener !== callback);
  };
}

// Get current connection state
export function getConnectionState() {
  return isConnected;
}

export default api;
