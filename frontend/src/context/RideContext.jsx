
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { ridesAPI } from '../api/api';
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
  
  const { currentUser, updateLocation, isDriver } = useAuth();
  
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
          
          // If user is logged in, update their location in the database
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
          
          console.log("User location obtained:", location);
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
      toast.error("Geolocation is not supported by your browser. Please enter your address manually.");
      setLoading(false);
    }
  }, [currentUser]);

  // Load ride history for the current user
  useEffect(() => {
    const loadRideHistory = async () => {
      if (!currentUser) return;
      
      try {
        const response = await ridesAPI.getRideHistory();
        setRides(response.data);
        
        // Check if there's an active ride
        const activeRides = response.data.filter(ride => 
          ["requested", "accepted", "in-progress"].includes(ride.status)
        );
        
        if (activeRides.length > 0) {
          setActiveRide(activeRides[0]);
        }
      } catch (error) {
        console.error("Failed to load ride history:", error);
      }
    };
    
    loadRideHistory();
  }, [currentUser]);
  
  // For drivers: Load available ride requests
  useEffect(() => {
    const loadAvailableRides = async () => {
      if (!currentUser || !isDriver) return;
      
      try {
        const response = await ridesAPI.getAvailableRides();
        setAvailableRides(response.data);
      } catch (error) {
        console.error("Failed to load available rides:", error);
      }
    };
    
    if (isDriver) {
      loadAvailableRides();
      
      // Refresh available rides every 30 seconds
      const interval = setInterval(loadAvailableRides, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, isDriver]);

  const requestRide = async (rideDetails) => {
    setLoading(true);
    
    try {
      if (!currentUser) {
        toast.error("You must be logged in to request a ride");
        setLoading(false);
        throw new Error("Authentication required");
      }
      
      // Convert frontend format to backend format
      console.log("Requesting ride with details:", rideDetails);
      

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
        vehicleType: rideDetails.vehicleType || 'economy'
      };
      
      console.log("Formatted ride request data:", rideRequestData);

      const response = await ridesAPI.requestRide(rideRequestData);
      const newRide = response.data;
      
      setRides(prev => [newRide, ...prev]);
      setActiveRide(newRide);
      
      toast.info("Your ride request has been submitted. Searching for drivers nearby.");
      
      setLoading(false);
      return newRide;
    } catch (error) {
      setLoading(false);
      console.error("Failed to request ride:", error);
      throw error;
    }
  };

  const cancelRide = async (rideId) => {
    setLoading(true);
    
    try {
      await ridesAPI.cancelRide(rideId);
      
      setRides(prev => prev.map(ride => 
        ride._id === rideId ? { ...ride, status: 'cancelled' } : ride
      ));
      
      if (activeRide && activeRide._id === rideId) {
        setActiveRide(prev => ({ ...prev, status: 'cancelled' }));
        toast.info("Ride cancelled successfully");
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Failed to cancel ride:", error);
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
        toast.success("Thank you for riding with us! Your ride is complete.");
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error("Failed to complete ride:", error);
      throw error;
    }
  };

  // For drivers to accept a ride
  const acceptRide = async (rideId) => {
    setLoading(true);
    
    try {
      const response = await ridesAPI.acceptRide(rideId);
      const updatedRide = response.data;
      
      // Update available rides list by removing the accepted ride
      setAvailableRides(prev => prev.filter(ride => ride._id !== rideId));
      
      // Add to driver's rides list
      setRides(prev => [updatedRide, ...prev]);
      setActiveRide(updatedRide);
      
      toast.success("You've accepted the ride. Please head to the pickup location.");
      
      setLoading(false);
      return updatedRide;
    } catch (error) {
      setLoading(false);
      console.error("Failed to accept ride:", error);
      throw error;
    }
  };

  // For drivers to start a ride
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
  
    const isCurrentLocation = addressText.trim().toLowerCase() === 'current location';
  
    if (isCurrentLocation) {
      // If already available from context, use it
      if (userLocation) {
        return {
          name: "Current Location",
          lat: userLocation.lat,
          lng: userLocation.lng
        };
      }
  
      // Else try to get fresh coordinates
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });
  
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
  
          // Optional: update the context state
          setUserLocation({ lat, lng });
  
          return {
            name: "Current Location",
            lat,
            lng
          };
        } catch (error) {
          console.error("Geolocation error while resolving current location:", error);
          throw new Error("Failed to retrieve your current location. Please enter it manually.");
        }
      } else {
        throw new Error("Geolocation is not supported in your browser.");
      }
    }
  
    // For other text inputs, use geocoding service
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
    // Driver specific methods
    acceptRide,
    startRide,
    availableRides
  };

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
}
