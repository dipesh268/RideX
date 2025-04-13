// Importing any necessary libraries for geocoding and location services
import axios from 'axios';

// Calculate distance between two points using the Haversine formula
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(point2.lat - point1.lat);
  const dLon = deg2rad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Estimate fare based on distance and vehicle type
export const estimateFare = (distanceKm, vehicleType = 'economy') => {
  const baseRates = {
    economy: 7,    // ₹7 per km
    premium: 10,   // ₹10 per km
    suv: 12,       // ₹12 per km
    xl: 15         // ₹15 per km
  };
  
  const baseFare = {
    economy: 50,   // ₹50 base fare
    premium: 80,   // ₹80 base fare
    suv: 100,      // ₹100 base fare
    xl: 120        // ₹120 base fare
  };
  
  const rate = baseRates[vehicleType] || baseRates.economy;
  const base = baseFare[vehicleType] || baseFare.economy;
  
  const calculatedFare = Math.round(base + (distanceKm * rate));
  
  return calculatedFare;
};

// Estimate time based on distance
export const estimateTime = (distanceKm) => {
  // Average speed of 30 km/h in Indian cities
  const avgSpeedKmPerHour = 30;
  
  // Time in minutes = (distance in km / speed in km per hour) * 60 minutes
  const timeMinutes = Math.round((distanceKm / avgSpeedKmPerHour) * 60);
  
  // Add 5-10 minutes for pickup time
  return timeMinutes + 5;
};

// Get vehicle types with descriptions and rates
export const getVehicleTypes = () => [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable, compact cars',
    rate: 7,
    image: '🚗',
    capacity: 4
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Comfortable sedans',
    rate: 10,
    image: '🚙',
    capacity: 4
  },
  {
    id: 'suv',
    name: 'SUV',
    description: 'Spacious SUVs',
    rate: 12,
    image: '🚓',
    capacity: 6
  },
  {
    id: 'xl',
    name: 'XL',
    description: 'Vans & minibuses',
    rate: 15,
    image: '🚐',
    capacity: 8
  }
];

// Get payment methods
export const getPaymentMethods = () => [
  {
    id: 'cash',
    name: 'Cash',
    type: 'cash',
    default: true
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card'
  },
  {
    id: 'upi',
    name: 'UPI Payment',
    type: 'upi'
  }
];
// Function to get current position with high accuracy
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy, // in meters
          timestamp: position.timestamp
        };
        resolve(location);
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
};

// Geocode Indian addresses to latitude and longitude using Nominatim OpenStreetMap API
export const geocodeIndianAddress = async (address) => {
  if (!address || address.trim() === '') {
    throw new Error("Address cannot be empty");
  }
  
  // Add "India" to the address if it's not already included
  const searchAddress = address.toLowerCase().includes('india') ? 
    address : `${address}, India`;
    
  try {
    const encodedAddress = encodeURIComponent(searchAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=in`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'RideApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error("No results found for the address");
    }
    
    const result = data[0];

    // Ensure coordinates are parsed as float values
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid coordinates returned from geocoding service");
    }
    
    return {
      name: address,
      lat: lat,
      lng: lng,
      displayName: result.display_name,
      // If there was correction or formatting done by the API
      corrected: result.display_name !== address
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error(`Could not find the location. ${error.message}`);
  }
};
