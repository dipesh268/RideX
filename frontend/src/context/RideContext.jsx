import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { ridesAPI, socket } from '../api/api';
import { useAuth } from './AuthContext';
import { 
  calculateDistance, 
  estimateFare, 
  estimateTime,
  geocodeIndianAddress
} from "../utils/locationUtils";

const RideContext = createContext();

export function useRide() {
  return useContext(RideContext);
}

export function RideProvider({ children }) {
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [scheduledRides, setScheduledRides] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { currentUser, updateLocation, isDriver } = useAuth();
  
  // // Monitor connection status
  // useEffect(() => {
  //   const unsubscribe = addConnectionListener(setIsConnected);
  //   return unsubscribe;
  // }, []);
  
  // Setup socket events
  useEffect(() => {
    if (currentUser) {
      socket.connect();
      
      // Join user-specific room
      socket.emit('join', { userId: currentUser._id, userType: currentUser.userType });
      
      // Handle new ride requests (for drivers)
      if (isDriver) {
        socket.on('ride:new', (ride) => {
          toast.info('New ride request available!');
          setAvailableRides(prev => [ride, ...prev]);
        });
      }
      
      // Handle ride updates
      socket.on('ride:update', (updatedRide) => {
        setRides(prevRides => 
          prevRides.map(ride => ride._id === updatedRide._id ? updatedRide : ride)
        );
        
        if (activeRide && activeRide._id === updatedRide._id) {
          setActiveRide(updatedRide);
          
          // Show appropriate notification based on ride status
          if (updatedRide.status === 'accepted') {
            alert('A driver has accepted your ride!');
          } else if (updatedRide.status === 'in-progress') {
            alert('Your ride has started');
          } else if (updatedRide.status === 'completed') {
            alert('Your ride has been completed');
          } else if (updatedRide.status === 'cancelled') {
            alert('Your ride has been cancelled');
          }
        }
      });
      
      return () => {
        socket.off('ride:new');
        socket.off('ride:update');
        socket.disconnect();
      };
    }
  }, [currentUser, isDriver, activeRide]);
  
  useEffect(() => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          
          if (currentUser) {
            try {
              await updateLocation({
                coordinates: [location.lng, location.lat],
                address: "Current Location"
              });
            } catch (error) {
              console.error("Failed to update user location:", error);
            }
          }
          
          //console.log("User location obtained:", location);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setUserLocation(null);
          toast.error("Couldn't access your location. Please enter your address manually.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation(null);
      //toast.error("Geolocation is not supported by your browser. Please enter your address manually.");
      setLoading(false);
    }
  }, [currentUser, updateLocation]);

  // Load ride history for current user
  const loadRideHistory = async () => {
    if (!currentUser) return;
    
    try {
      const response = await ridesAPI.getRideHistory();
      //console.log("Loaded ride history:", response.data);
      setRides(response.data);
      
      // Extract scheduled rides
      const scheduled = response.data.filter(ride => 
        ride.isScheduled && ride.status === 'requested'
      );
      setScheduledRides(scheduled);
      
      // Check if there's an active ride
      const activeRides = response.data.filter(ride => 
        ["requested", "accepted", "in-progress"].includes(ride.status) && 
        !ride.isScheduled
      );
      
      if (activeRides.length > 0) {
        setActiveRide(activeRides[0]);
      } else {
        setActiveRide(null);
      }
    } catch (error) {
      console.error("Failed to load ride history:", error);
    }
  };

  useEffect(() => {
    loadRideHistory();
    
    // Set up auto-refresh for ride history if enabled
    if (autoRefresh && currentUser) {
      const interval = setInterval(() => {
        loadRideHistory();
      }, 20000); // Every 20 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentUser, autoRefresh]);
  
  // Load available rides for drivers
  useEffect(() => {
    const loadAvailableRides = async () => {
      if (!currentUser || !isDriver) return;
      
      try {
        // Get immediate ride requests
        const response = await ridesAPI.getAvailableRides();
        setAvailableRides(response.data);
        
        // Get scheduled rides separately
        const scheduledResponse = await ridesAPI.getScheduledRides();
        setScheduledRides(scheduledResponse.data);
      } catch (error) {
        console.error("Failed to load available rides:", error);
      }
    };
    
    if (isDriver) {
      loadAvailableRides();
      
      // Refresh available rides on interval if auto-refresh is enabled
      if (autoRefresh) {
        const interval = setInterval(loadAvailableRides, 15000); // Every 15 seconds
        return () => clearInterval(interval);
      }
    }
  }, [currentUser, isDriver, autoRefresh]);

  const requestRide = async (rideDetails) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        toast.error("You must be logged in to request a ride");
        setLoading(false);
        throw new Error("Authentication required");
      }
      
      //console.log("Requesting ride with details:", rideDetails);
      
      // Ensure coordinates are properly structured for MongoDB GeoJSON
      const rideRequestData = {
        pickup: {
          type: "Point",
          coordinates: [
            parseFloat(rideDetails.pickup.lng), 
            parseFloat(rideDetails.pickup.lat)
          ],
          address: rideDetails.pickup.name || "Current Location"
        },
        dropoff: {
          type: "Point",
          coordinates: [
            parseFloat(rideDetails.destination.lng), 
            parseFloat(rideDetails.destination.lat)
          ],
          address: rideDetails.destination.name
        },
        fare: rideDetails.fare,
        distance: parseFloat(rideDetails.distance),
        duration: rideDetails.estimatedTime,
        vehicleType: rideDetails.vehicleType || 'economy',
        scheduledTime: rideDetails.scheduledTime || null,
        isScheduled: !!rideDetails.scheduledTime
      };
      
      console.log("Formatted ride request data:", rideRequestData);
      
      const response = await ridesAPI.requestRide(rideRequestData);
      const newRide = response.data;
      
      await loadRideHistory(); // Refresh ride history to include the new ride
      
      if (rideDetails.scheduledTime) {
        alert("Your ride has been scheduled successfully!");
      } else {
        alert("Your ride request has been submitted. Searching for drivers nearby.");
      }
      
      setLoading(false);
      return newRide;
    } catch (error) {
      setLoading(false);
      console.error("Failed to request ride:", error);
      throw error;
    }
  };

  // Enhanced cancel ride functionality for both rider and driver
  const cancelRide = async (rideId) => {
    setLoading(true);
    
    try {
      console.log("Cancelling ride:", rideId);
      const response = await ridesAPI.cancelRide(rideId);
      
      // Update both the rides array and activeRide if it exists
      if (response.data) {
        setRides(prev => prev.map(ride => 
          ride._id === rideId ? { ...ride, status: 'cancelled' } : ride
        ));
        
        if (activeRide && activeRide._id === rideId) {
          setActiveRide(prev => ({ ...prev, status: 'cancelled' }));
        }
        
        alert("Ride cancelled successfully");
        
        // Refresh the ride history
        await loadRideHistory();
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Failed to cancel ride:", error);
      toast.error(error.response?.data?.message || "Failed to cancel ride");
      throw error;
    }
  };
  
  // Added reject ride functionality for drivers
  const rejectRide = async (rideId) => {
    setLoading(true);
    
    try {
      console.log("Rejecting ride:", rideId);
      
      // Call reject API endpoint if it exists
      try {
        await ridesAPI.rejectRide(rideId);
      } catch (error) {
        // If the endpoint doesn't exist yet, just continue with the UI update
        console.warn("Reject ride API may not be implemented:", error);
      }
      
      // Remove the ride from available rides array
      setAvailableRides(prev => prev.filter(ride => ride._id !== rideId));
      
      toast.info("Ride request ignored");
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Failed to reject ride:", error);
      throw error;
    }
  };

  const completeRide = async (rideId) => {
    setLoading(true);
    
    try {
      await ridesAPI.completeRide(rideId);
      
      setRides(prev => prev.map(ride => 
        ride._id === rideId ? { ...ride, status: 'completed', completedAt: new Date().toISOString() } : ride
      ));
      
      if (activeRide && activeRide._id === rideId) {
        const completed = { ...activeRide, status: 'completed', completedAt: new Date().toISOString() };
        setActiveRide(completed);
        alert("Thank you for riding with us! Your ride is complete.");
      }
      
      // Refresh ride history
      await loadRideHistory();
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Failed to complete ride:", error);
      throw error;
    }
  };

  const acceptRide = async (rideId) => {
    setLoading(true);
    
    try {
      const response = await ridesAPI.acceptRide(rideId);
      const updatedRide = response.data;
      
      // Remove from available rides list
      setAvailableRides(prev => prev.filter(ride => ride._id !== rideId));
      
      // Also remove from scheduled rides if it was a scheduled ride
      setScheduledRides(prev => prev.filter(ride => ride._id !== rideId));
      
      // Refresh ride history to include the newly accepted ride
      await loadRideHistory();
      
      toast.success("You've accepted the ride. Please head to the pickup location.");
      
      setLoading(false);
      return updatedRide;
    } catch (error) {
      setLoading(false);
      console.error("Failed to accept ride:", error);
      throw error;
    }
  };

  const startRide = async (rideId) => {
    setLoading(true);
    
    try {
      const response = await ridesAPI.startRide(rideId);
      const updatedRide = response.data;
      
      setRides(prev => prev.map(ride => 
        ride._id === rideId ? updatedRide : ride
      ));
      
      if (activeRide && activeRide._id === rideId) {
        setActiveRide(updatedRide);
        toast.success("Ride started. Safe journey!");
      }
      
      setLoading(false);
      return updatedRide;
    } catch (error) {
      setLoading(false);
      console.error("Failed to start ride:", error);
      throw error;
    }
  };

  const calculateRideDistance = (pickup, destination) => {
    return calculateDistance(pickup, destination);
  };

  const estimateRideFare = (pickup, destination, vehicleTypeId = 'economy') => {
    return new Promise((resolve) => {
      const distance = calculateRideDistance(pickup, destination);
      
      if (distance === 0) {
        resolve({
          fare: 0,
          distance: '0.0',
          estimatedTime: 0
        });
        return;
      }
      
      const fare = estimateFare(distance, vehicleTypeId);
      
      const estimatedTime = estimateTime(distance);
      
      resolve({
        fare,
        distance: distance.toFixed(1),
        estimatedTime
      });
    });
  };

  const geocodeAddress = async (addressText) => {
    if (!addressText || addressText.trim() === '') {
      throw new Error("Address text is empty");
    }
    
    if (addressText.toLowerCase() === 'current location') {
      if (userLocation) {
        return {
          name: "Current Location",
          lat: userLocation.lat,
          lng: userLocation.lng
        };
      } else {
        throw new Error("User location not available. Please enable location services or enter an address manually.");
      }
    }
    
    try {
      return await geocodeIndianAddress(addressText);
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const value = {
    rides,
    activeRide,
    setActiveRide,
    loading,
    userLocation,
    requestRide,
    cancelRide,
    completeRide,
    estimateFare: estimateRideFare,
    calculateDistance: calculateRideDistance,
    geocodeAddress,
    acceptRide,
    startRide,
    availableRides,
    rejectRide,
    scheduledRides,
    loadRideHistory,
    isConnected,
    autoRefresh,
    setAutoRefresh
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};
