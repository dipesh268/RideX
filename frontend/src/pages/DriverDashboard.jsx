
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide } from '../context/RideContext';
import { socket } from '../api/api';
import { toast } from "sonner";
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import RideHistoryItem from '../components/RideHistoryItem';
import { formatCurrency } from '../utils/mapUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import VehicleDetailsForm from '../components/VehicleDetailsForm';

const DriverDashboard = () => {
  const { currentUser, isDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [processingRideId] = useState(null);
  

  
  // Redirect if not logged in or not a driver
  useEffect(() => {
    if (!currentUser) {
      navigate('/login?type=driver');
    } else if (!isDriver) {
      navigate('/rider');
    }
  }, [currentUser, isDriver, navigate]);
  
  if (!currentUser || !isDriver) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<DriverHome />} />
        <Route path="/earnings" element={<DriverEarnings />} />
        <Route path="/profile" element={<DriverProfile />} />
        <Route path="/vehicle_details" element={<VehicleDetailsForm />} />
        <Route path="*" element={<Navigate to="/driver" replace />} />
      </Routes>
    </div>
  );
};

// Home page for drivers
const DriverHome = () => {
  const { currentUser, updateUser } = useAuth();
  const { availableRides, acceptRide, activeRide, startRide, completeRide, rides } = useRide();
  const [isOnline, setIsOnline] = useState(currentUser?.isOnline || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Connect to socket.io when component mounts
  useEffect(() => {
    if (currentUser) {
      socket.connect();
      
      // Listen for new ride requests
      socket.on('ride:available', (ride) => {
        console.log('New ride available:', ride);
        toast.info("New ride request available!");
      });
      
      // Clean up on unmount
      return () => {
        socket.off('ride:available');
        socket.disconnect();
      };
    }
  }, [currentUser]);
  
  // Toggle driver online status
  const toggleOnlineStatus = async () => {
    try {
      setIsLoading(true);
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      
      // Update in the database
      await updateUser({ isOnline: newStatus });
      
      // Update socket connection
      if (newStatus) {
        socket.emit('driver:online', { 
          driverId: currentUser._id,
          vehicleType: currentUser.vehicleType || 'economy'
        });
        toast.success("You are now online and can receive ride requests");
      } else {
        socket.emit('driver:offline', { 
          driverId: currentUser._id,
          vehicleType: currentUser.vehicleType || 'economy'
        });
        toast.info("You are now offline");
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
      setIsOnline(!isOnline); // Revert UI state
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Accept a ride request
  const handleAcceptRide = async (rideId) => {
    try {
      setIsLoading(true);
      await acceptRide(rideId);
      toast.success("You have accepted the ride request");
    } catch (error) {
      console.error('Failed to accept ride:', error);
      toast.error("Failed to accept the ride request");
    } finally {
      setIsLoading(false);
    }
  };

    // Reject a ride request
    const handleRejectRide = async (rideId) => {
      try {
        setProcessingRideId(rideId);
        setIsLoading(true);
        await rejectRide(rideId);
        toast.success("You have rejected the ride request");
      } catch (error) {
        console.error('Failed to reject ride:', error);
        toast.error("Failed to reject the ride request");
      } finally {
        setIsLoading(false);
        setProcessingRideId(null);
      }
    };
  
  // Start current ride
  const handleStartRide = async () => {
    if (!activeRide) return;
    
    try {
      setIsLoading(true);
      await startRide(activeRide._id);
      toast.success("Ride started successfully!");
    } catch (error) {
      console.error('Failed to start ride:', error);
      toast.error("Failed to start the ride");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Complete current ride
  const handleCompleteRide = async () => {
    if (!activeRide) return;
    
    try {
      setIsLoading(true);
      await completeRide(activeRide._id);
      toast.success("Ride completed successfully!");
    } catch (error) {
      console.error('Failed to complete ride:', error);
      toast.error("Failed to complete the ride");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate today's earnings from completed rides
  const calculateTodayEarnings = () => {
    if (!rides || rides.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRides = rides.filter(ride => {
      if (!ride.completedAt || ride.status !== 'completed') return false;
      const rideDate = new Date(ride.completedAt);
      return rideDate >= today;
    });
    
    return todayRides.reduce((total, ride) => total + (ride.fare || 0), 0);
  };
  
  // Calculate weekly earnings from completed rides
  const calculateWeeklyEarnings = () => {
    if (!rides || rides.length === 0) return 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekRides = rides.filter(ride => {
      if (!ride.completedAt || ride.status !== 'completed') return false;
      const rideDate = new Date(ride.completedAt);
      return rideDate >= oneWeekAgo;
    });
    
    return weekRides.reduce((total, ride) => total + (ride.fare || 0), 0);
  };
  
  // Get data for earnings chart
  const getEarningsChartData = () => {
    if (!rides || rides.length === 0) return [];
    
    const now = new Date();
    const daysToShow = 7;
    const dailyData = [];
    
    // Create data points for the last 7 days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      // Find rides completed on this day
      const dayRides = rides.filter(ride => {
        if (!ride.completedAt || ride.status !== 'completed') return false;
        const rideDate = new Date(ride.completedAt);
        return rideDate >= day && rideDate < nextDay;
      });
      
      const dayEarnings = dayRides.reduce((total, ride) => total + (ride.fare || 0), 0);
      
      dailyData.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayEarnings
      });
    }
    
    return dailyData;
  };
  
  const todayEarnings = calculateTodayEarnings();
  const weeklyEarnings = calculateWeeklyEarnings();
  const completedRides = rides?.filter(ride => ride.status === 'completed') || [];
  const completedRidesCount = completedRides.length;
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <div>
          <button
            onClick={toggleOnlineStatus}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
              isOnline 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            {isLoading ? 'Updating...' : isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-10rem)]">
            <MapView 
              height="h-full" 
              pickupLocation={activeRide?.pickup}
              destinationLocation={activeRide?.dropoff}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {activeRide ? (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Current Ride</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {activeRide.status.charAt(0).toUpperCase() + activeRide.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${activeRide.rider?.name || 'User'}&background=random`}
                    alt={activeRide.rider?.name || 'Rider'}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-medium">{activeRide.rider?.name || 'Rider'}</p>
                    <p className="text-sm text-muted-foreground">{activeRide.rider?.phone || ''}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-full pt-1">
                      <div className="w-5 flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="h-12 w-0.5 bg-gray-300 my-0.5"></div>
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="mb-2 line-clamp-1">{activeRide.pickup?.address || 'Pickup Location'}</p>
                      <p className="line-clamp-1">{activeRide.dropoff?.address || 'Destination'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Fare</span>
                    <p className="font-semibold">₹{activeRide.fare?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance</span>
                    <p className="font-semibold">{activeRide.distance || '0'} km</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time</span>
                    <p className="font-semibold">{activeRide.duration || '0'} min</p>
                  </div>
                </div>
                
                {activeRide.status === 'accepted' ? (
                  <button
                    onClick={handleStartRide}
                    disabled={isLoading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Start Ride'}
                  </button>
                ) : activeRide.status === 'in-progress' ? (
                  <button
                    onClick={handleCompleteRide}
                    disabled={isLoading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Complete Ride'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : isOnline ? (
            <>
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50">
                  <h3 className="font-semibold">Ride Requests</h3>
                </div>
                
                <div className="divide-y divide-border">
                  {availableRides && availableRides.length > 0 ? (
                    availableRides.map(request => (
                      <div key={request._id} className="p-4">
                        <div className="flex items-center mb-3">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${request.rider?.name || 'User'}&background=random`}
                            alt={request.rider?.name || 'Rider'}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-medium">{request.rider?.name || 'Rider'}</p>
                            <p className="text-sm text-muted-foreground">{request.rider?.phone || ''}</p>
                          </div>
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
                              <p className="mb-2 line-clamp-1">{request.pickup?.address || 'Pickup Location'}</p><br/>
                              <p className="line-clamp-1">{request.dropoff?.address || 'Destination'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Fare</span>
                            <p className="font-semibold">₹{request.fare?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Distance</span>
                            <p className="font-semibold">{request.distance || '0'} km</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time</span>
                            <p className="font-semibold">{request.duration || '0'} min</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptRide(request._id)}
                            disabled={isLoading}
                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Processing...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRejectRide(request._id)}
                            className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-muted-foreground mb-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                      <p className="text-muted-foreground">No ride requests at the moment</p>
                      <p className="text-sm text-muted-foreground mt-1">New requests will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50">
                  <h3 className="font-semibold">Today's Summary</h3>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Earnings</p>
                      <p className="text-xl font-bold">₹{todayEarnings.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rides</p>
                      <p className="text-xl font-bold">{completedRidesCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Hours</p>
                      <p className="text-xl font-bold">{(completedRidesCount * 0.5).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">You're currently offline</h3>
              <p className="text-muted-foreground mb-6">Go online to start receiving ride requests</p>
              <button
                onClick={toggleOnlineStatus}
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Go Online'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Earnings page
const DriverEarnings = () => {
  const { rides } = useRide();
  const [timeframe, setTimeframe] = useState('week');
  
  // Calculate earnings from completed rides
  const calculateEarnings = () => {
    if (!rides || rides.length === 0) {
      return { today: 0, week: 0, month: 0 };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    // Filter completed rides by date
    const todayRides = rides.filter(ride => {
      if (!ride.completedAt || ride.status !== 'completed') return false;
      const rideDate = new Date(ride.completedAt);
      return rideDate >= today;
    });
    
    const weekRides = rides.filter(ride => {
      if (!ride.completedAt || ride.status !== 'completed') return false;
      const rideDate = new Date(ride.completedAt);
      return rideDate >= oneWeekAgo;
    });
    
    const monthRides = rides.filter(ride => {
      if (!ride.completedAt || ride.status !== 'completed') return false;
      const rideDate = new Date(ride.completedAt);
      return rideDate >= oneMonthAgo;
    });
    
    // Sum up fares
    return {
      today: todayRides.reduce((total, ride) => total + (ride.fare || 0), 0),
      week: weekRides.reduce((total, ride) => total + (ride.fare || 0), 0),
      month: monthRides.reduce((total, ride) => total + (ride.fare || 0), 0)
    };
  };
  
  // Get data for the earnings chart
  const getEarningsChartData = () => {
    if (!rides || rides.length === 0) return [];
    
    const now = new Date();
    const daysToShow = timeframe === 'week' ? 7 : 30;
    const dailyData = [];
    
    // Create data points for the last 7 or 30 days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      // Find rides completed on this day
      const dayRides = rides.filter(ride => {
        if (!ride.completedAt || ride.status !== 'completed') return false;
        const rideDate = new Date(ride.completedAt);
        return rideDate >= day && rideDate < nextDay;
      });
      
      const dayEarnings = dayRides.reduce((total, ride) => total + (ride.fare || 0), 0);
      
      dailyData.push({
        date: timeframe === 'week' 
          ? day.toLocaleDateString('en-US', { weekday: 'short' })
          : day.getDate().toString(),
        amount: dayEarnings
      });
    }
    
    return dailyData;
  };
  
  const earnings = calculateEarnings();
  const historyData = getEarningsChartData();
  const completedRides = rides?.filter(ride => ride.status === 'completed') || [];
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">View your earnings history and statistics</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="text-sm text-muted-foreground mb-1">Today's Earnings</div>
          <div className="text-3xl font-bold">₹{earnings.today.toFixed(2)}</div>
        </div>
        
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="text-sm text-muted-foreground mb-1">This Week</div>
          <div className="text-3xl font-bold">₹{earnings.week.toFixed(2)}</div>
        </div>
        
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="text-sm text-muted-foreground mb-1">This Month</div>
          <div className="text-3xl font-bold">₹{earnings.month.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
          <h3 className="font-semibold">Earnings Overview</h3>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'week' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'month' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="p-4 h-80">
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Earnings']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No earnings data available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <h3 className="font-semibold">Recent Rides</h3>
        </div>
        
        <div className="divide-y divide-border">
          {completedRides.length > 0 ? (
            completedRides.slice(0, 5).map(ride => (
              <div key={ride._id} className="p-4">
                <RideHistoryItem ride={ride} />
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No completed rides yet</p>
            </div>
          )}
        </div>
        
        {completedRides.length > 5 && (
          <div className="p-4 border-t border-border bg-muted/50 text-center">
            <button className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              View All Rides
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile page
const DriverProfile = () => {
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
        <p className="text-muted-foreground">Manage your account and vehicle information</p>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.email || currentUser.phone}</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Driver
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Verified
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Full Name
                </label>
                <input 
                  type="text"
                  defaultValue={currentUser.name}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email
                </label>
                <input 
                  type="email"
                  defaultValue={currentUser.email || ""}
                  placeholder="Add email address"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  defaultValue={currentUser.phone || ""}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Date of Birth
                </label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          
          {/* <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Vehicle Make
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Toyota"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Vehicle Model
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Camry"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Year
                </label>
                <input 
                  type="number"
                  placeholder="e.g. 2020"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  License Plate
                </label>
                <input 
                  type="text"
                  placeholder="e.g. ABC1234"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Vehicle Type
                </label>
                <select className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-card">
                  <option value="economy">Economy</option>
                  <option value="premium">Premium</option>
                  <option value="suv">SUV</option>
                  <option value="xl">XL</option>
                </select>
              </div>
            </div>
          </div>
           */}
          <div className="mt-8 border-t border-border pt-6 flex gap-4">
            <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Save Changes
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
