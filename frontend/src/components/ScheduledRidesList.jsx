
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ScheduledRidesList = ({ rides, onCancel }) => {
  if (!rides || rides.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-1">No scheduled rides</h3>
        <p className="text-sm text-muted-foreground">
          You don't have any rides scheduled for the future.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upcoming Rides</h3>
      {rides.map((ride) => (
        <div key={ride._id} className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              <span className="font-medium">
                {ride.scheduledTime 
                  ? format(new Date(ride.scheduledTime), "MMMM d, yyyy") 
                  : "No date specified"}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              <span>
                {ride.scheduledTime 
                  ? format(new Date(ride.scheduledTime), "h:mm a") 
                  : "No time specified"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-full pt-1">
                <div className="w-5 flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-12 w-0.5 bg-gray-300 my-0.5"></div>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                </div>
              </div>
              <div className="ml-2 flex-1">
                <p className="mb-2 line-clamp-1 text-sm">
                  <span className="text-muted-foreground">From: </span>
                  {ride.pickup?.address || "Current location"}
                </p>
                <p className="line-clamp-1 text-sm">
                  <span className="text-muted-foreground">To: </span>
                  {ride.dropoff?.address}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm mb-4 border-t border-border pt-3">
            <div>
              <span className="text-muted-foreground">Fare</span>
              <p className="font-semibold">₹{ride.fare?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Distance</span>
              <p className="font-semibold">{ride.distance?.toFixed(1) || "0.0"} km</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time</span>
              <p className="font-semibold">{ride.duration || "0"} min</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              variant="destructive" 
              size="sm"
              onClick={() => onCancel(ride._id)}
            >
              Cancel Ride
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScheduledRidesList;
