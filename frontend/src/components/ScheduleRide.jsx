
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useRide } from '../context/RideContext';
import { useToast } from '../hooks/use-toast';
import ScheduledRidesList from '../components/ScheduledRidesList';

const ScheduledRides = () => {
  const { rides, cancelRide, loadRideHistory } = useRide();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduledRides, setScheduledRides] = useState([]);
  const navigate = useNavigate();
  
  // Filter scheduled rides from all rides
  useEffect(() => {
    if (rides && rides.length > 0) {
      const scheduled = rides.filter(ride => 
        ride.isScheduled && 
        ride.status === 'requested' && 
        ride.scheduledTime
      );
      setScheduledRides(scheduled);
    }
  }, [rides]);
  
  // Reload ride history when component mounts
  useEffect(() => {
    loadRideHistory();
  }, []);
  
  const handleCancelRide = async (rideId) => {
    setLoading(true);
    try {
      await cancelRide(rideId);
      toast({
        title: "Ride cancelled",
        description: "Your scheduled ride has been cancelled successfully.",
      });
      await loadRideHistory();
    } catch (error) {
      console.error("Failed to cancel ride:", error);
      toast({
        title: "Cancellation failed",
        description: "Could not cancel the ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Scheduled Rides
        </h1>
        <p className="text-muted-foreground">View and manage your upcoming rides</p>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <ScheduledRidesList 
          rides={scheduledRides} 
          onCancel={handleCancelRide} 
        />
      )}
    </div>
  );
};

export default ScheduledRides;
