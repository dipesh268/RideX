
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { checkConnection, subscribeToConnection } from '../api/api';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = subscribeToConnection(status => {
      setIsConnected(status);
    });

    // Initial connection check
    handleCheckConnection();

    // Set up regular connection checks
    const intervalId = setInterval(handleCheckConnection, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const handleCheckConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await checkConnection();
      // The subscription will handle the state update
    } catch (error) {
      console.error("Connection check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
      <WifiOff size={18} />
      <span className="text-sm">Offline</span>
      <button
        onClick={handleCheckConnection}
        disabled={isChecking}
        className="ml-2 p-1 bg-white rounded-full"
        aria-label="Try reconnecting"
      >
        <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
      </button>
    </div>
  );
};

export default ConnectionStatus;
