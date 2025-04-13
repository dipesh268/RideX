
// Function to create a custom map marker icon
export const createMarkerIcon = (type, className = "") => {
  const icon = document.createElement("div");
  icon.className = `map-marker ${type}-marker ${className}`;
  
  let innerContent = "";
  switch (type) {
    case "user":
      innerContent = `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>`;
      break;
    case "driver":
      innerContent = `<div class="w-6 h-6 bg-accent-foreground rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                      </div>`;
      break;
    case "pickup":
      innerContent = `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>`;
      break;
    case "destination":
      innerContent = `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>`;
      break;
    default:
      innerContent = `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>`;
  }
  
  icon.innerHTML = innerContent;
  return icon;
};

// Function to draw a route between two points
export const drawRoute = (map, routingControl, pickup, destination) => {
  if (routingControl) {
    try {
      map.removeControl(routingControl);
    } catch (e) {
      console.error("Error removing routing control:", e);
    }
  }
  
  if (!pickup || !destination) {
    console.log("Missing pickup or destination coordinates", pickup, destination);
    return null;
  }
  
  console.log("Drawing route between coordinates:", 
    [pickup.lat, pickup.lng], 
    [destination.lat, destination.lng]
  );
  
  // Make sure we have valid coordinates
  if (isNaN(pickup.lat) || isNaN(pickup.lng) || isNaN(destination.lat) || isNaN(destination.lng)) {
    console.error("Invalid coordinates for routing:", pickup, destination);
    return null;
  }
  
  // Use Leaflet Routing Machine if available
  if (window.L && window.L.Routing) {
    try {
      console.log("Using Leaflet Routing Machine");
      const newRoutingControl = window.L.Routing.control({
        waypoints: [
          window.L.latLng(parseFloat(pickup.lat), parseFloat(pickup.lng)),
          window.L.latLng(parseFloat(destination.lat), parseFloat(destination.lng))
        ],
        lineOptions: {
          styles: [
            { color: '#3b82f6', opacity: 0.8, weight: 5 }, // Primary color from Tailwind
            { color: 'white', opacity: 0.3, weight: 10 }   // Glow effect
          ]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: function() { return null; }, // Don't create default markers
        router: window.L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        })
      }).addTo(map);
      
      // Hide the routing control sidebar but keep the route line
      const routingContainer = newRoutingControl.getContainer();
      if (routingContainer) {
        routingContainer.style.display = 'none';
      }
      
      // Add a listener to handle route computation errors
      newRoutingControl.on('routingerror', function(e) {
        console.error('Routing error:', e.error);
        // Fall back to simple polyline if there's a routing error
        return createSimpleRoute(map, pickup, destination);
      });
      
      return newRoutingControl;
    } catch (error) {
      console.error("Error creating routing control:", error);
      // Fall back to simple polyline if there's an error
      return createSimpleRoute(map, pickup, destination);
    }
  }
  
  // Fallback to a simple polyline if Routing Machine is not available
  return createSimpleRoute(map, pickup, destination);
};

// Create a simple polyline route as fallback
const createSimpleRoute = (map, pickup, destination) => {
  console.log("Using simple polyline for route between:", 
    [pickup.lat, pickup.lng], 
    [destination.lat, destination.lng]
  );
  
  try {
    const polyline = window.L.polyline(
      [
        [parseFloat(pickup.lat), parseFloat(pickup.lng)],
        [parseFloat(destination.lat), parseFloat(destination.lng)]
      ],
      { 
        color: '#3b82f6', 
        opacity: 0.8, 
        weight: 5,
        smoothFactor: 1
      }
    ).addTo(map);
    
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    
    return {
      removeFrom: (map) => {
        map.removeLayer(polyline);
      }
    };
  } catch (error) {
    console.error("Error creating simple route:", error);
    return null;
  }
};

// Helper functions for formatting data
export const formatCurrency = (amount) => {
  return `₹${amount}`;
};

export const formatDistance = (distance) => {
  if (!distance) return '0 km';
  
  const dist = parseFloat(distance);
  if (dist < 0.1) {
    return `${Math.round(dist * 1000)} m`;
  } else {
    return `${dist.toFixed(1)} km`;
  }
};

export const formatTime = (minutes) => {
  if (!minutes) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// Process location input from user and return valid coordinates
export const processLocationInput = (locationText, userLocation) => {
  if (!locationText || !userLocation) {
    console.log("Invalid location input:", locationText, userLocation);
    return null;
  }
  
  // If user selected "Current Location", return their actual location
  if (locationText.toLowerCase() === 'current location') {
    console.log("Using current location:", userLocation);
    return {
      name: "Current Location",
      ...userLocation
    };
  }
  
  // In a real app, this would connect to a geocoding service
  console.log("Processing location input:", locationText);
  
  // For the demo, we'll use the actual text input to create a deterministic 
  // (non-random) location near the user's current position
  const hash = locationText.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const lat_offset = (hash % 100) / 1000;
  const lng_offset = ((hash >> 8) % 100) / 1000;
  
  return { 
    name: locationText,
    lat: userLocation.lat + lat_offset, 
    lng: userLocation.lng + lng_offset 
  };
};
