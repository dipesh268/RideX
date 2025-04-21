import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { authAPI, userAPI } from '../api/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check if user is stored in localStorage on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await userAPI.getCurrentUser();
          setCurrentUser(response.data);
          console.log("User authenticated:", response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, []);

  // Register a new user
    const register = async (userData) => {
      setLoading(true);
      try {
        console.log('Registering with data:', userData);
        const response = await authAPI.register(userData);
        const { token, user } = response.data;

        if (!token) {
          throw new Error("No token received from server");
        }  
        
        localStorage.setItem('token', token);
        setCurrentUser(user);
        
        alert(`Welcome, ${user.name}!`);
        setLoading(false);
        return user;
      } catch (error) {
        alert('Registration failed:', error);
        setLoading(false);
        throw error;
      }
    };
  
    // Login user
    const login = async (credentials) => {
        setLoading(true);
        try {
          console.log('Logging in with:', credentials);
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;
          console.log(token);
          localStorage.setItem('token', token);
          setCurrentUser(user);
          
          alert(`Welcome back, ${user.name}!`);
          setLoading(false);
          return user;
        } catch (error) {
          console.error('Login failed:', error);
          setLoading(false);
          throw error;
        }
      };
  
      // Update user info - Fixed to properly handle both name and email updates
  const updateUserInfo = async (userData) => {
    if (!currentUser) {
      toast.error("You must be logged in to update your profile");
      return null;
    }
    
    setLoading(true);
    try {
      console.log('Updating user with data:', userData);
      const response = await authAPI.updateUser(userData);
      
      if (response.data && response.data.user) {
        setCurrentUser(response.data.user);
        toast.success('Profile updated successfully');
      } else {
        throw new Error("Invalid response from server");
      }
      
      setLoading(false);
      return response.data.user;
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      setLoading(false);
      throw error;
    }
  };
   
    // Logout function
    const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('token');
      toast.info("You've been signed out");
    };
  // Update user location
  const updateLocation = async (location) => {
    if (!currentUser) return;
    
    try {
      const response = await userAPI.updateLocation(location);
      setCurrentUser(prev => ({
        ...prev,
        currentLocation: response.data.currentLocation
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  // Toggle online status (for drivers)
  const toggleOnlineStatus = async (isOnline) => {
    if (!currentUser) return;
    
    try {
      const response = await userAPI.toggleOnlineStatus(isOnline);
      setCurrentUser(prev => ({
        ...prev,
        isOnline: response.data.isOnline
      }));
      
      if (isOnline) {
        toast.success("You are now online and can receive ride requests");
      } else {
        toast.info("You are now offline");
      }
      
      return response.data;
    } catch (error) {
      console.error('Error toggling online status:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isRider: currentUser?.userType === 'rider',
    isDriver: currentUser?.userType === 'driver',
    loading,
    authChecked,
    register,
    login,
    updateUserInfo,
    logout,
    updateLocation,
    toggleOnlineStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {authChecked && children}
    </AuthContext.Provider>
  );
}