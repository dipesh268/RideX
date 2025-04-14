
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const RideRequestCard = ({ ride, onAccept, onReject }) => {
  const formattedCreatedAt = ride.createdAt 
    ? formatDistanceToNow(new Date(ride.createdAt), { addSuffix: true })
    : 'just now';
    
  const isScheduled = ride.isScheduled && ride.scheduledTime;
  
  // Format scheduled time if available
  const formattedScheduledTime = isScheduled 
    ? new Date(ride.scheduledTime).toLocaleString() 
    : null;
    
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
            <h3 className="font-medium text-card-foreground">
              {isScheduled ? 'Scheduled Ride' : 'New Ride Request'}
            </h3>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              {isScheduled ? `For ${formattedScheduledTime}` : `${formattedCreatedAt}`}
            </span>
          </div>
        </div>
        
        <div className="mt-2 space-y-2">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-full pt-1">
              <div className="w-5 flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-16 w-0.5 bg-gray-300 my-0.5"></div>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
            </div>
            <div className="ml-2 flex flex-col flex-1">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{ride.pickup?.address || 'Unknown location'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="text-sm font-medium">{ride.dropoff?.address || 'Unknown location'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Fare</p>
            <p className="font-semibold">${ride.fare ? ride.fare.toFixed(2) : '0.00'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Distance</p>
            <p className="font-semibold">{ride.distance ? `${ride.distance} km` : 'Unknown'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Time</p>
            <p className="font-semibold">{ride.duration ? `${ride.duration} min` : 'Unknown'}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
        <button
          onClick={() => onReject && onReject(ride._id)}
          className="py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Reject
        </button>
        <button
          onClick={() => onAccept && onAccept(ride._id)}
          className="py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default RideRequestCard;
