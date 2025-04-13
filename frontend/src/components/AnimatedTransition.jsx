
import React, { useEffect, useState } from 'react';

const AnimatedTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Delay showing the component slightly to ensure smooth animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`page-transition ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      style={{ 
        transition: 'opacity 300ms ease-out, transform 300ms ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedTransition;
