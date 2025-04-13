
import React, { useState, useEffect } from 'react';
import { useRide } from '../context/RideContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  getVehicleTypes, 
  getPaymentMethods,
  geocodeIndianAddress
} from '../utils/locationUtils';
import { formatCurrency, formatDistance, formatTime } from '../utils/mapUtils';
import '../index.css'

const RideForm = ({ onRideRequested }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDestination, setIsGeocodingDestination] = useState(false);
  const [correctedPickup, setCorrectedPickup] = useState(null);
  const [correctedDestination, setCorrectedDestination] = useState(null);
  
  
  const { estimateFare, requestRide, userLocation, geocodeAddress } = useRide();
  const { currentUser } = useAuth();
  
  // Load dynamic data on component mount
  useEffect(() => {
    // Get vehicle types
    const vehicleTypesList = getVehicleTypes();
    setVehicleTypes(vehicleTypesList);
    setSelectedVehicle(vehicleTypesList[0]);
    
    // Get payment methods
    const paymentMethodsList = getPaymentMethods();
    setPaymentMethods(paymentMethodsList);
    setPaymentMethod(paymentMethodsList.find(method => method.default) || paymentMethodsList[0]);
  }, []);
  
  // Set default pickup to user location when component mounts
  useEffect(() => {
    if (userLocation) {
      setPickupCoords(userLocation);
      setPickup('Current Location');
      
      console.log("Setting default pickup location to user location:", userLocation);
      
      // Pass coordinates to the parent component for map display
      if (onRideRequested) {
        onRideRequested({
          pickup: { name: 'Current Location', ...userLocation },
          destination: destinationCoords ? { name: destination, ...destinationCoords } : null
        });
      }
    }
  }, [userLocation]);
  
  // Handle geocoding of addresses when the user finishes typing
  const handleGeocodeAddress = async (locationType, value) => {
    if (locationType === 'pickup') {
      setIsGeocodingPickup(true);
      
      try {
        if (value.toLowerCase() === 'current location' && userLocation) {
          setPickupCoords(userLocation);
          setCorrectedPickup(null);
          
          // Pass coordinates to the parent component for map display
          if (onRideRequested) {
            onRideRequested({
              pickup: { name: 'Current Location', ...userLocation },
              destination: destinationCoords ? { name: destination, ...destinationCoords } : null
            });
          }
        } else {
          const geocodeResult = await geocodeIndianAddress(value);
          setPickupCoords(geocodeResult);
          
          // Check if address was auto-corrected
          if (geocodeResult.corrected) {
            setCorrectedPickup(geocodeResult.name);
            toast.info(`Address auto-corrected to: ${geocodeResult.name}`);
          } else {
            setCorrectedPickup(null);
          }
          
          // Pass coordinates to the parent component for map display
          if (onRideRequested) {
            onRideRequested({
              pickup: { name: geocodeResult.name, ...geocodeResult },
              destination: destinationCoords ? { name: destination, ...destinationCoords } : null
            });
          }
          
          toast.success(`Found location: ${geocodeResult.displayName}`);
        }
      } catch (error) {
        console.error("Error geocoding pickup location:", error);
        toast.error(error.message || "Couldn't find the pickup location");
        setPickupCoords(null);
        setCorrectedPickup(null);
      } finally {
        setIsGeocodingPickup(false);
      }
    } else {
      setIsGeocodingDestination(true);
      
      try {
        const geocodeResult = await geocodeIndianAddress(value);
        setDestinationCoords(geocodeResult);
        
        // Check if address was auto-corrected
        if (geocodeResult.corrected) {
          setCorrectedDestination(geocodeResult.name);
          toast.info(`Address auto-corrected to: ${geocodeResult.name}`);
        } else {
          setCorrectedDestination(null);
        }
        
        // Pass coordinates to the parent component for map display
        if (onRideRequested && pickupCoords) {
          onRideRequested({
            pickup: { name: pickup, ...pickupCoords },
            destination: { name: geocodeResult.name, ...geocodeResult }
          });
        }
        
        toast.success(`Found destination: ${geocodeResult.displayName}`);
      } catch (error) {
        console.error("Error geocoding destination location:", error);
        toast.error(error.message || "Couldn't find the destination location");
        setDestinationCoords(null);
        setCorrectedDestination(null);
      } finally {
        setIsGeocodingDestination(false);
      }
    }
  };
  
  // Debounce input to prevent too many API calls
  const handleLocationInput = (locationType, value) => {
    if (locationType === 'pickup') {
      setPickup(value);
      // Reset the corrected address when user modifies the input
      setCorrectedPickup(null);
    } else {
      setDestination(value);
      // Reset the corrected address when user modifies the input
      setCorrectedDestination(null);
    }
  };
  
  // Get fare estimate
  const getEstimate = async () => {
    if (!pickupCoords || !destinationCoords) {
      toast.error("Please enter valid pickup and destination locations");
      return;
    }
    
    console.log("Calculating fare estimate between:", pickupCoords, destinationCoords);
    
    try {
      const estimate = await estimateFare(pickupCoords, destinationCoords, selectedVehicle?.id);
      console.log("Fare estimate result:", estimate);
      
      setEstimatedFare(estimate);
      
      // Move to next step if we're still on step 1
      if (formStep === 1) {
        setFormStep(2);
      }
    } catch (error) {
      console.error('Error getting estimate:', error);
      toast.error("Could not calculate fare. Please try again.");
    }
  };
  
  // Handle vehicle type selection
  const handleVehicleSelect = async (vehicle) => {
    setSelectedVehicle(vehicle);
    
    // Re-calculate fare estimate with new vehicle type
    if (pickupCoords && destinationCoords) {
      try {
        const estimate = await estimateFare(pickupCoords, destinationCoords, vehicle.id);
        setEstimatedFare(estimate);
      } catch (error) {
        console.error('Error recalculating estimate:', error);
      }
    }
  };
  
  // Request a ride
  const handleRequestRide = async () => {
    if (!pickupCoords || !destinationCoords || !estimatedFare || !selectedVehicle || !paymentMethod) {
      toast.error("Please complete all required fields");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const pickupName = correctedPickup || pickup;
      const destinationName = correctedDestination || destination;
      
      if (!pickupCoords.lat || !pickupCoords.lng || !destinationCoords.lat || !destinationCoords.lng) {
        throw new Error("Invalid coordinates. Please search for locations again.");
      }
      
      const rideDetails = {
        riderId: currentUser?.id,
        riderName: currentUser?.name,
        pickup: {
          name: pickupName,
          name: pickupName,
          lat: parseFloat(pickupCoords.lat),
          lng: parseFloat(pickupCoords.lng)
        },
        destination: {
          name: destinationName,
          lat: parseFloat(destinationCoords.lat),
          lng: parseFloat(destinationCoords.lng)
        },
        fare: estimatedFare.fare,
        estimatedTime: estimatedFare.estimatedTime,
        distance: estimatedFare.distance,
        paymentMethod: paymentMethod.type,
        vehicleType: selectedVehicle.id
      };
      
      console.log("Requesting ride with details:", rideDetails);
      
      const ride = await requestRide(rideDetails);
      
      // Reset form
      setFormStep(1);
      setIsProcessing(false);
      
      // Notify parent component
      if (onRideRequested) {
        onRideRequested(ride);
      }
      
      toast.success("Ride request submitted successfully. Waiting for a driver to accept.");
    } catch (error) {
      console.error('Error requesting ride:', error);
      toast.error(error.message || "Could not request ride. Please try again.");
      setIsProcessing(false);
    }
  };
  
  // Use the corrected address if available
  const displayPickupAddress = correctedPickup || pickup;
  const displayDestinationAddress = correctedDestination || destination;
  
  return (
    <div className="bg-card rounded-xl shadow-lg p-4 border border-border">
      {formStep === 1 ? (
        /* Step 1: Location selection */
        <>
          <h2 className="text-xl font-semibold mb-4">Where are you going?</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-muted-foreground mb-1">
                Pickup Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                </div>
                <input
            type="text"
            id="pickup"
            value={pickup}
            onChange={(e) => handleLocationInput('pickup', e.target.value)}
            placeholder="Current location"
            className="w-full pl-2 border rounded d1" 
          />
              </div>
              {correctedPickup && (
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Auto-corrected to: {correctedPickup}
                </div>
              )}
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Enter any Indian address or 'Current Location'
                </p>
                <button 
                  onClick={() => pickup && handleGeocodeAddress('pickup', pickup)}
                  className="text-xs text-primary hover:underline"
                  disabled={!pickup || isGeocodingPickup}
                >
                  {isGeocodingPickup ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-muted-foreground mb-1">
                Destination
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                </div>
                <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => handleLocationInput('destination', e.target.value)}
            placeholder="Where to?"
            className="w-full pl-2 border rounded d1"
          />
              </div>
              {correctedDestination && (
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Auto-corrected to: {correctedDestination}
                </div>
              )}
              <div className="flex justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Enter any Indian address
                </p>
                <button 
                  onClick={() => destination && handleGeocodeAddress('destination', destination)}
                  className="text-xs text-primary hover:underline"
                  disabled={!destination || isGeocodingDestination}
                >
                  {isGeocodingDestination ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            {pickup && destination && pickupCoords && destinationCoords && (
              <button
                onClick={getEstimate}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Fare Estimate
              </button>
            )}
          </div>
        </>
      ) : (
        /* Step 2: Vehicle and payment selection */
        <>
          <h2 className="text-xl font-semibold mb-4">Choose Your Ride</h2>
          
          {estimatedFare && (
            <div className="mb-6 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Fare</p>
                  <p className="text-2xl font-bold">{formatCurrency(estimatedFare.fare)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">{formatDistance(estimatedFare.distance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-medium">{formatTime(estimatedFare.estimatedTime)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {vehicleTypes.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVehicle && selectedVehicle.id === vehicle.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-gray-300 hover:bg-accent/50'
                  }`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">₹{vehicle.rate}/km</p>
                    </div>
                    <div className="text-xl">{vehicle.image}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod && paymentMethod.id === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-gray-300 hover:bg-accent/50'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                      {method.type === 'card' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      )}
                      {method.type === 'cash' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m-6-1.5H4.5m0 0L3 16.5m0 0L1.5 15m3 0h12" />
                        </svg>
                      )}
                      {method.type === 'upi' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      )}
                    </div>
                    <span>{method.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setFormStep(1)}
              className="flex-1 py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleRequestRide}
              disabled={isProcessing}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </span>
              ) : (
                'Confirm Ride'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RideForm;
