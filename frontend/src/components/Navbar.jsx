
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Calendar, User, History, LogOut, MapPin } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isRider, isDriver, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActivePath = (paths) => {
    return paths.some(path => location.pathname === path);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  
  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold tracking-tight">
                RideX
              </Link>
            </div>
            
            {currentUser && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {isRider && (
                  <>
                    <Link
                      to="/rider"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/rider', '/rider/']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Book a Ride
                    </Link>
                    
                    <Link
                      to="/rider/history"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/rider/history']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Ride History
                    </Link>
                    
                    <Link
                      to="/rider/scheduled"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/rider/scheduled']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Scheduled Rides
                    </Link>
                  </>
                )}
                
                {isDriver && (
                  <>
                    <Link
                      to="/driver"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/driver', '/driver/']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Available Rides
                    </Link>
                    
                    <Link
                      to="/Driver/earnings"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/DriverEarnings']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Earning
                    </Link>
                    
                    <Link
                      to="/driver/scheduled"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/driver/scheduled']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Scheduled Rides
                    </Link>
                    <Link
                      to="/Driver/vehicle_details"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActivePath(['/DriverEarnings']) 
                          ? 'border-primary text-foreground' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Vehicle Details
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={isRider ? "/rider/profile" : "/driver/profile"}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActivePath(['/rider/profile', '/driver/profile']) 
                      ? 'border-primary text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login?type=rider"
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Rider Login
                </Link>
                <Link
                  to="/login?type=driver"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded"
                >
                  Driver Login
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {currentUser && isRider && (
            <>
              <Link
                to="/rider"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/rider', '/rider/'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Book a Ride
              </Link>
              
              <Link
                to="/rider/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/rider/history'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <History className="h-5 w-5 mr-2" />
                Ride History
              </Link>
              
              <Link
                to="/rider/scheduled"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/rider/scheduled'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Scheduled Rides
              </Link>
              
              <Link
                to="/rider/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/rider/profile'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Link>
            </>
          )}
          
          {currentUser && isDriver && (
            <>
              <Link
                to="/driver"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/driver', '/driver/'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Available Rides
              </Link>
              
              <Link
                to="/driver/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/driver/history'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <History className="h-5 w-5 mr-2" />
                Ride History
              </Link>
              
              <Link
                to="/driver/scheduled"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/driver/scheduled'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Scheduled Rides
              </Link>
              
              <Link
                to="/driver/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  isActivePath(['/driver/profile'])
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                } rounded-md`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Link>
            </>
          )}
          
          {!currentUser && (
            <>
              <Link
                to="/login?type=rider"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted"
              >
                Rider Login
              </Link>
              <Link
                to="/login?type=driver"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 m-2"
              >
                Driver Login
              </Link>
            </>
          )}
          
          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-destructive hover:bg-muted rounded-md"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
