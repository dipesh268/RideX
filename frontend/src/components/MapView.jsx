
import React, { useEffect, useRef, useState } from 'react';
import { useRide } from '../context/RideContext';
import { createMarkerIcon, drawRoute } from '../utils/mapUtils';
import { useIsMobile } from '../hooks/use-mobile';
import { toast } from 'sonner';
import { getCurrentPosition } from '../utils/locationUtils';

const MapView = ({ height = 'h-[400px]', showControls = true, pickupLocation, destinationLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routingControlRef = useRef(null);
  const { userLocation, activeRide } = useRide();
  const isMobile = useIsMobile();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  
  // Get accurate user location on mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const position = await getCurrentPosition();
        setUserCurrentLocation(position);
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    };
    
    getUserLocation();
    
    // Set up a location watch if we need continuous updates
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Geolocation watch error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  
  // Set up map on component mount
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Load Leaflet and Leaflet Routing Machine from CDN if not already loaded
    if (!window.L) {
      //console.log("Loading Leaflet library...");
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptElement.onload = () => {
        console.log("Leaflet loaded, loading Routing Machine...");
        // Load Leaflet Routing Machine after Leaflet is loaded
        const routingScript = document.createElement('script');
        routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        routingScript.onload = () => {
          console.log("Leaflet Routing Machine loaded");
          initializeMap();
          setMapLoaded(true);
        };
        document.head.appendChild(routingScript);
        
        // Load Routing Machine CSS
        const routingCss = document.createElement('link');
        routingCss.rel = 'stylesheet';
        routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        document.head.appendChild(routingCss);
      };
      document.head.appendChild(scriptElement);
    } else {
      // Check if routing machine is loaded
      if (!window.L.Routing) {
        console.log("Loading Routing Machine...");
        const routingScript = document.createElement('script');
        routingScript.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
        routingScript.onload = () => {
          console.log("Leaflet Routing Machine loaded");
          initializeMap();
          setMapLoaded(true);
        };
        document.head.appendChild(routingScript);
        
        // Load Routing Machine CSS
        const routingCss = document.createElement('link');
        routingCss.rel = 'stylesheet';
        routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        document.head.appendChild(routingCss);
      } else {
        initializeMap();
        setMapLoaded(true);
      }
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      if (routingControlRef.current) {
        try {
          mapInstanceRef.current?.removeControl(routingControlRef.current);
        } catch (e) {
          console.log("Error removing routing control:", e);
        }
        routingControlRef.current = null;
      }
    };
  }, []);
  
  // Initialize the map
  const initializeMap = () => {
    if (!window.L || mapInstanceRef.current) return;
    
    // Use the most accurate location we have
    const initialLocation = userCurrentLocation || userLocation || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
    
    try {
      console.log("Initializing map with center:", initialLocation);
      const map = window.L.map(mapRef.current, {
        center: [initialLocation.lat, initialLocation.lng],
        zoom: 13,
        attributionControl: false
      });
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
      
      // Add user location marker
      if (initialLocation) {
        addMarker('user', initialLocation);
      }
      
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };
  
  // Update map when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || !mapLoaded) return;

    // Use the most accurate and recent location data
    const currentLocation = userCurrentLocation || userLocation;
    
  //   console.log("Updating map with locations:", { 
  //     current: currentLocation,
  //     pickup: pickupLocation, 
  //     destination: destinationLocation, 
  //     activeRide 
  //   }
  // );
    
    // Clear existing markers
    clearMarkers();
    
    // Add user location marker
    if (currentLocation) {
      addMarker('user', currentLocation);
    }
    
    // Convert backend format to frontend format if needed
    const getValidCoordinates = (location) => {
      if (!location) return null;
      
      // Handle both formats: {lat, lng} and {coordinates: [lng, lat]}
      if (location.lat !== undefined && location.lng !== undefined) {
        return { lat: location.lat, lng: location.lng };
      } else if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
        return { lat: location.coordinates[1], lng: location.coordinates[0] };
      }
      return null;
    };
    
    // Add pickup and destination markers
    let pickup = getValidCoordinates(pickupLocation) || (activeRide && getValidCoordinates(activeRide.pickup));
    let destination = getValidCoordinates(destinationLocation) || (activeRide && getValidCoordinates(activeRide.dropoff));
    
    //console.log("Processing pickup location:", pickup);
    //console.log("Processing destination location:", destination);
    
    if (pickup) {
      addMarker('pickup', pickup);
    }
    
    if (destination) {
      addMarker('destination', destination);
    }
    
    // Add driver marker if available
    if (activeRide?.driver?.location) {
      const driverLocation = getValidCoordinates(activeRide.driver.location);
      if (driverLocation) {
        addMarker('driver', driverLocation);
      }
    }
    
    // Draw route if we have both pickup and destination
    if (pickup && destination) {
      console.log("Drawing route between:", pickup, destination);
      try {
        if (routingControlRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }
        
        routingControlRef.current = drawRoute(
          mapInstanceRef.current,
          routingControlRef.current,
          pickup,
          destination
        );
        
        // Fit map to show the whole route with padding
        if (routingControlRef.current) {
          // Let the routing control handle bounds
          console.log("Using routing control for bounds");
        } else {
          // Manual bounds calculation as fallback
          console.log("Manually calculating bounds");
          const bounds = window.L.latLngBounds(
            [parseFloat(pickup.lat), parseFloat(pickup.lng)],
            [parseFloat(destination.lat), parseFloat(destination.lng)]
          );
          
          if (currentLocation) {
            bounds.extend([currentLocation.lat, currentLocation.lng]);
          }
          
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Error drawing route:", error);
      }
    } else if (pickup) {
      // Center on pickup if only pickup is available
      //console.log("Centering on pickup location");
      mapInstanceRef.current.setView([pickup.lat, pickup.lng], 14);
    } else if (currentLocation) {
      // Fall back to user location
      //console.log("Centering on user location");
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 14);
    }
  }, [userCurrentLocation, userLocation, pickupLocation, destinationLocation, activeRide, mapLoaded]);
  
  // Add a marker to the map
  const addMarker = (type, location) => {
    if (!mapInstanceRef.current || !window.L || !location || !location.lat || !location.lng) {
      console.log("Cannot add marker, invalid location:", location);
      return;
    }
    
    //console.log(`Adding ${type} marker at:`, location);
    
    try {
      const iconHtml = createMarkerIcon(type);
      
      const customIcon = window.L.divIcon({
        html: iconHtml,
        className: 'custom-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      const marker = window.L.marker([parseFloat(location.lat), parseFloat(location.lng)], { icon: customIcon }).addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
      
      // Add pulse animation for user location
      if (type === 'user') {
        const pulseIcon = window.L.divIcon({
          html: `<div class="w-12 h-12 bg-primary/30 rounded-full animate-pulse-gentle"></div>`,
          className: 'pulse-icon',
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        
        const pulseMarker = window.L.marker([location.lat, location.lng], { icon: pulseIcon }).addTo(mapInstanceRef.current);
        markersRef.current.push(pulseMarker);
      }
      
      return marker;
    } catch (error) {
      console.error(`Error adding ${type} marker:`, error);
      return null;
    }
  };
  
  // Clear all markers from the map
  const clearMarkers = () => {
    if (!mapInstanceRef.current) return;
    
    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch (e) {
        console.error("Error removing marker:", e);
      }
    });
    
    markersRef.current = [];
  };
  
  // Handle map control buttons
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };
  
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };
  
  const handleCenterOnUser = async () => {
    try {
      // Try to get the most accurate current position
      const position = await getCurrentPosition();
      setUserCurrentLocation(position);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([position.lat, position.lng], 15);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      toast.error("Couldn't access your current location");
      
      // Fall back to the last known location
      if (mapInstanceRef.current && userLocation) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
      }
    }
  };
  
  return (
    <div className={`w-full ${height} relative rounded-xl overflow-hidden shadow-lg transition-all duration-300`}>
      <div ref={mapRef} className="w-full h-full rounded-xl"></div>
      
      {showControls && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <button 
            onClick={handleCenterOnUser}
            className="w-10 h-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Center on my location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;
