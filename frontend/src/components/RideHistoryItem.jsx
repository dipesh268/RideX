
import React from 'react';
import { formatCurrency, formatDate, formatDistance } from '../utils/mapUtils';

const RideHistoryItem = ({ ride }) => {
  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      accepted: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
      requested: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"}`}>
        {status === 'completed' && 'Completed'}
        {status === 'cancelled' && 'Cancelled'}
        {status === 'in-progress' && 'In Progress'}
        {status === 'accepted' && 'Accepted'}
        {status === 'requested' && 'Finding Driver'}
      </span>
    );
  };
  
  const getTimeOrDate = () => {
    const timestamp = ride.createdAt || new Date().toISOString();
    return formatDate(timestamp);
  };
  
  return (
    <div className="bg-card rounded-lg border border-border hover:shadow-md transition-shadow p-4 hover-lift cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 m-2 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{getTimeOrDate()}</p>
              <p className="text-xs text-muted-foreground">{getStatusBadge(ride.status)}</p>
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-full pt-1">
                <div className="w-5 flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="h-6 w-0.5 bg-gray-300 my-0.5"></div>
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                </div>
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm mb-2 text-gray-600 dark:text-gray-300 line-clamp-1">
                  {ride.pickup?.address || "Unknown pickup location"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                  {ride.dropoff?.address || "Unknown destination"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold">{formatCurrency(ride.fare)}</p>
          <p className="text-xs text-muted-foreground">{formatDistance(ride.distance)}</p>
        </div>
      </div>
    </div>
  );
};

export default RideHistoryItem;
