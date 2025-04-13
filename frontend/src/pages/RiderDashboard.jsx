
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide } from '../context/RideContext';
import { toast } from "sonner";
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import RideForm from '../components/RideForm';
import DriverCard from '../components/DriverCard';
import RideHistoryItem from '../components/RideHistoryItem';

const RiderDashboard = () => {
  const { currentUser, isRider } = useAuth();
  const { activeRide, rides, userLocation, cancelRide } = useRide();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login?type=rider');
    } else if (!isRider) {
      navigate('/driver');
    }
  }, [currentUser, isRider, navigate]);
  
  if (!currentUser || !isRider) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<RiderHome />} />
        <Route path="/history" element={<RideHistory />} />
        <Route path="/profile" element={<RiderProfile />} />
        <Route path="*" element={<Navigate to="/rider" replace />} />
      </Routes>
    </div>
  );
};

const RiderHome = () => {
  const { activeRide, cancelRide, userLocation } = useRide();
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleRideRequested = (data) => {
    console.log("Updating map with locations:", data);
    
    if (data.pickup) {
      setPickupLocation(data.pickup);
    }
    
    if (data.destination) {
      setDestinationLocation(data.destination);
    }
  };
  
  const handleCallDriver = () => {
    toast.info("This feature is not available in the demo version");
  };
  
  const handleCancelRide = async () => {
    if (!activeRide) return;
    
    try {
      await cancelRide(activeRide.id);
      toast.success("Ride cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel ride");
      console.error(error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className={`sticky top-0 z-10 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-md' : ''}`}>
        <div className="container mx-auto px-4 py-2">
          <h1 className="text-xl font-semibold">Ride Booking</h1>
        </div>
      </div>
      
      <div className="container py-4 px-4 mx-auto max-w-7xl flex-grow">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
              <MapView 
                height="h-full" 
                pickupLocation={pickupLocation || (activeRide?.pickup)}
                destinationLocation={destinationLocation || (activeRide?.destination)}
              />
            </div>
          </div>
          
          <div className="md:col-span-1 space-y-4">
            {activeRide ? (
              <>
                <div className="p-4 bg-muted rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Current Ride</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeRide.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                      activeRide.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                      activeRide.status === 'searching' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    }`}>
                      {activeRide.status.charAt(0).toUpperCase() + activeRide.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-full pt-1">
                        <div className="w-5 flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <div className="h-12 w-0.5 bg-gray-300 my-0.5"></div>
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        </div>
                      </div>
                      <div className="ml-2 flex-1">
                      {(pickupLocation || activeRide?.pickup) && (destinationLocation || activeRide?.destination) ? (
    <MapView 
      height="h-full" 
      pickupLocation={pickupLocation || activeRide?.pickup}
      destinationLocation={destinationLocation || activeRide?.destination}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
      Waiting for pickup and destination...
    </div>
  )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Fare</span>
                      <p className="font-semibold">${activeRide.fare.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distance</span>
                      <p className="font-semibold">{activeRide.distance} km</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time</span>
                      <p className="font-semibold">{activeRide.estimatedTime} min</p>
                    </div>
                  </div>
                </div>
                
                {activeRide.driver && (
                  <DriverCard 
                    driver={activeRide.driver} 
                    ride={activeRide}
                    onCallDriver={handleCallDriver}
                    onCancelRide={handleCancelRide}
                  />
                )}
                
                {!activeRide.driver && activeRide.status === 'searching' && (
                  <div className="p-4 bg-card rounded-xl border border-border mb-4">
                    <div className="flex flex-col items-center justify-center py-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="font-medium mb-1">Looking for drivers</p>
                      <p className="text-sm text-muted-foreground mb-3 text-center">
                        This is a demo application. No real drivers will be assigned.
                      </p>
                      <button 
                        onClick={handleCancelRide}
                        className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        Cancel Ride
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <RideForm onRideRequested={handleRideRequested} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RideHistory = () => {
  const { rides } = useRide();
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ride History</h1>
        <p className="text-muted-foreground">View your past rides and receipts</p>
      </div>
      
      <div className="space-y-4">
        {rides.length > 0 ? (
          rides.map(ride => (
            <RideHistoryItem key={ride.id} ride={ride} />
          ))
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-muted-foreground mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-muted-foreground">You don't have any rides yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RiderProfile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Rider
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Verified
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  defaultValue={currentUser.name}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email
                </label>
                <input 
                  type="email"
                  defaultValue={currentUser.email}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Date Joined
                </label>
                <input 
                  type="text"
                  defaultValue={new Date().toLocaleDateString()}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50"
                  readOnly
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-center text-sm text-muted-foreground">
                  Payment methods are not available in the demo version
                </p>
              </div>
              
              <button className="w-full flex items-center justify-center p-3 border border-dashed border-input rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Payment Method
              </button>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive emails about your rides and promotions</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                  <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-6" htmlFor="toggle-1"></label>
                  <input type="checkbox" id="toggle-1" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" defaultChecked />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive text messages about your ride status</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                  <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-0" htmlFor="toggle-2"></label>
                  <input type="checkbox" id="toggle-2" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme for the app interface</p>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                  <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-0" htmlFor="toggle-3"></label>
                  <input type="checkbox" id="toggle-3" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
