import React from 'react';

const DriverCard = ({ driver, ride, onCallDriver, onCancelRide, onComplete }) => {
  if (!driver) return null;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'requested':
        return 'Finding driver...';
      case 'accepted':
        return 'Driver accepted';
      case 'in-progress':
        return 'On trip';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown status';
    }
  };
  
  // Format driver name
  const driverName = driver.name || (driver.email ? driver.email.split('@')[0] : 'Driver');
  
  // Create avatar URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=random`;
  
  return (
    <div className="bg-card rounded-xl shadow-lg p-4 border border-border element-transition">
      <div className="flex items-center">
        <div className="relative">
          <img
            src={avatarUrl}
            alt={driverName}
            className="w-16 h-16 rounded-full object-cover border-2 border-white"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{driverName}</h3>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-500 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="text-sm">4.9 • {driver.phone || 'Contact via app'}</span>
              </div>
            </div>
            
            {ride && (
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ride.status)} text-white`}>
                  {getStatusText(ride.status)}
                </span>
              </div>
            )}
          </div>
          
          {ride && ride.status === 'accepted' && (
            <div className="mt-2 text-sm">
              <div>Arriving soon</div>
              <div className="text-muted-foreground">{driver.phone}</div>
            </div>
          )}
        </div>
      </div>
      
      {ride && ['accepted', 'in-progress', 'requested'].includes(ride.status) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onCallDriver && onCallDriver(driver)}
            className="flex items-center justify-center py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call
          </button>
          <button
            onClick={() => onCancelRide && onCancelRide(ride._id)}
            className="flex items-center justify-center py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      )}
      
      {ride && ride.status === 'in-progress' && (
        <div className="mt-4">
          <button
            onClick={() => onComplete && onComplete(ride._id)}
            className="w-full flex items-center justify-center py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Complete Ride
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverCard;
