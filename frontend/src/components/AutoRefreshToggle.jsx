
import React from 'react';
import { useRide } from '../context/RideContext';

const AutoRefreshToggle = () => {
  const { autoRefresh, setAutoRefresh } = useRide();
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
        <label 
          className={`absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer ${
            autoRefresh ? 'translate-x-6' : 'translate-x-0'
          }`}
          htmlFor="auto-refresh-toggle"
        ></label>
        <input 
          type="checkbox" 
          id="auto-refresh-toggle" 
          className="w-full h-full opacity-0 absolute rounded-full cursor-pointer"
          checked={autoRefresh} 
          onChange={() => setAutoRefresh(!autoRefresh)}
        />
      </div>
      <label htmlFor="auto-refresh-toggle" className="text-sm font-medium cursor-pointer">
        Auto refresh {autoRefresh ? 'enabled' : 'disabled'}
      </label>
    </div>
  );
};

export default AutoRefreshToggle;
