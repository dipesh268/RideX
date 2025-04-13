
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isRider, isDriver } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <span className="ml-2 text-lg font-semibold">RideX</span>
            </Link>
          </div>
          
          {currentUser ? (
            <>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {isRider && (
                  <>
                    <Link 
                      to="/rider"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/rider') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/rider/history"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/rider/history') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Ride History
                    </Link>
                    <Link 
                      to="/rider/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/rider/profile') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}
                
                {isDriver && (
                  <>
                    <Link 
                      to="/driver"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/driver') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/driver/earnings"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/driver/earnings') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Earnings
                    </Link>
                    <Link 
                      to="/driver/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/driver/profile') 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <img 
                        className="h-8 w-8 rounded-full object-cover"
                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                        alt={currentUser.name}
                      />
                    </button>
                    <span className="ml-2 text-sm font-medium">{currentUser.name}</span>
                  </div>
                  
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
          
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                {isRider && (
                  <>
                    <Link
                      to="/rider"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/rider')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/rider/history"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/rider/history')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Ride History
                    </Link>
                    <Link
                      to="/rider/profile"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/rider/profile')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}
                
                {isDriver && (
                  <>
                    <Link
                      to="/driver"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/driver')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/driver/earnings"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/driver/earnings')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Earnings
                    </Link>
                    <Link
                      to="/driver/profile"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/driver/profile')
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
