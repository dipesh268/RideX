
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Index = () => {
  const { currentUser, isRider, isDriver } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Taxi illustration images - can be extended with more images for a slideshow effect
  const taxiImages = [
    // "https://images.unsplash.com/photo-1631110670573-48cf786e1944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    // "https://images.unsplash.com/photo-1600320254374-ce163492a5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Change image every 5 seconds for a slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % taxiImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [taxiImages.length]);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % taxiImages.length);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main>
        {/* Hero section */}
        <section className="relative px-4 pt-16 md:pt-24 lg:pt-32 pb-20 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  Simple. Fast. Reliable.
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Your ride, on <span className="text-primary">demand</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Experience the future of transportation with RideX. Request a ride at the tap of a button and get where you need to go—safely, reliably, and affordably.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {currentUser ? (
                  <Link
                    to={isRider ? "/rider" : isDriver ? "/driver" : "/login"}
                    className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/20 animate-scale-in"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login?type=rider"
                      className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/20 animate-scale-in"
                    >
                      Ride with us
                    </Link>
                    <Link
                      to="/login?type=driver"
                      className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground text-lg font-medium hover:bg-secondary/90 transition-colors"
                    >
                      Become a driver
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative lg:pl-8 animate-float">
              <div 
                className="aspect-square max-w-lg mx-auto cursor-pointer overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-105"
                onClick={handleImageClick}
              >
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={taxiImages[currentImageIndex]}
                  alt="Taxi service illustration"
                  className={`relative rounded-2xl shadow-2xl object-cover w-full h-full z-10 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={handleImageLoad}
                />
                <div className="absolute bottom-4 right-4 z-20 flex space-x-1">
                  {taxiImages.map((_, index) => (
                    <button 
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity z-10 flex items-end justify-center pb-8">
                  <p className="text-white text-sm font-medium">Click to view next image</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 text-center">
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold">10M+</p>
              <p className="text-sm md:text-base text-muted-foreground">Users</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold">5K+</p>
              <p className="text-sm md:text-base text-muted-foreground">Drivers</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold">100+</p>
              <p className="text-sm md:text-base text-muted-foreground">Cities</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold">4.8</p>
              <p className="text-sm md:text-base text-muted-foreground">Rating</p>
            </div>
          </div> */}
        </section>
        
        {/* Features section */}
        <section className="px-4 py-20 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Why choose RideX?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless experience for both riders and drivers, focusing on safety, speed, and satisfaction.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow element-transition">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Pickup</h3>
              <p className="text-muted-foreground">
                Our drivers are strategically positioned throughout the city to ensure quick pickups whenever you need a ride.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow element-transition">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Rides</h3>
              <p className="text-muted-foreground">
                Safety is our priority. All drivers undergo background checks and our app includes safety features for peace of mind.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow element-transition">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75m-6-1.5H4.5m0 0L3 16.5m0 0L1.5 15m3 0h12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Payments</h3>
              <p className="text-muted-foreground">
                Choose how you want to pay, whether it's cash, card, or digital payment methods like UPI.
              </p>
            </div>
          </div>
        </section>
        
        {/* App Section */}
        {/* <section className="px-4 py-20 bg-muted">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <img
                  src="https://images.unsplash.com/photo-1594077114133-a68e815e1799?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Mobile app"
                  className="rounded-2xl shadow-xl mx-auto max-w-sm"
                />
              </div>
              
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Download our app</h2>
                <p className="text-lg text-muted-foreground">
                  Get the full RideX experience on your mobile device. Request rides, track your driver, and manage your account with our intuitive app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M17.5698 1H6.06976C3.96976 1 2.45976 2.51 2.45976 4.61V19.1C2.44976 19.42 2.48976 19.74 2.56976 20.05C2.92976 21.53 4.18976 22.61 5.67976 22.73C5.80976 22.73 5.90976 22.75 6.03976 22.75H17.5498C19.7498 22.75 21.5398 20.96 21.5398 18.76V4.99C21.5598 2.79 19.7698 1 17.5698 1Z"/>
                      <path fill="white" d="M9.32944 10.28C9.32944 10.71 9.32944 11.15 9.32944 11.59C9.32944 12.87 9.32944 14.15 9.33944 15.43C9.33944 15.55 9.31944 15.68 9.32944 15.8C9.37944 16.28 9.82944 16.6 10.2994 16.55C10.7694 16.5 11.1294 16.06 11.1294 15.55C11.1294 13.86 11.1294 12.18 11.1294 10.49C11.1294 10.33 11.1294 10.17 11.1294 9.99C11.5594 10.36 11.9294 10.65 12.2794 10.95C12.6294 11.25 12.9794 11.55 13.3194 11.86C13.6494 12.15 14.0694 12.15 14.3894 11.86C14.6794 11.59 14.7094 11.2 14.4494 10.88C13.6294 9.88 12.8094 8.88 11.9794 7.9C11.5694 7.42 10.8894 7.42 10.4894 7.9C9.64944 8.89 8.82944 9.9 7.99944 10.9C7.71944 11.23 7.73944 11.63 8.03944 11.91C8.32944 12.18 8.74944 12.15 9.06944 11.87C9.14944 11.8 9.21944 11.71 9.30944 11.64C9.91944 11.12 9.91944 11.12 9.32944 10.28Z"/>
                    </svg>
                    <span>App Store</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M17.5707 1H6.07071C3.97071 1 2.46071 2.51 2.46071 4.61V19.1C2.45071 19.42 2.49071 19.74 2.57071 20.05C2.93071 21.53 4.19071 22.61 5.68071 22.73C5.81071 22.73 5.91071 22.75 6.04071 22.75H17.5507C19.7507 22.75 21.5407 20.96 21.5407 18.76V4.99C21.5607 2.79 19.7807 1 17.5707 1Z"/>
                      <path fill="white" d="M7.75977 12.9301C7.75977 14.6001 9.28977 15.9301 11.3198 15.6601C12.5398 15.4901 13.4098 14.5101 13.4198 13.2701C13.4198 11.7701 12.0598 10.5901 10.3498 10.8001C8.91977 10.9801 7.74977 11.8301 7.75977 12.9301ZM15.2098 9.15006C16.0398 10.1901 16.4898 11.4601 16.4498 12.7901C16.4498 13.7901 16.0098 14.7001 15.2498 15.3701C14.8798 15.7001 14.8698 16.1901 15.1998 16.5501C15.5298 16.9101 16.0298 16.9301 16.3998 16.5801C17.4398 15.6701 18.0998 14.2801 18.0998 12.7901C18.1198 11.0101 17.4498 9.25006 16.1498 7.90006C15.7998 7.53006 15.2898 7.56006 14.9498 7.92006C14.6098 8.28006 14.6298 8.78006 14.9898 9.15006C15.0598 9.15006 15.1398 9.15006 15.2098 9.15006Z"/>
                    </svg>
                    <span>Google Play</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        
        {/* Testimonials */}
        <section className="px-4 py-20 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">What our users say</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from riders and drivers who have experienced RideX firsthand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=random" 
                    alt="Sarah Johnson" 
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <div className="flex items-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I use RideX daily for my commute. The drivers are always professional and the cars are clean. The app is super intuitive and I can always count on a quick pickup."
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src="https://ui-avatars.com/api/?name=Michael+Chen&background=random" 
                    alt="Michael Chen" 
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Michael Chen</p>
                  <div className="flex items-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-300">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "As a driver, RideX gives me the flexibility to work on my own schedule. The app is easy to use and the support team is always responsive when I need help."
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full"
                    src="https://ui-avatars.com/api/?name=Emily+Davis&background=random" 
                    alt="Emily Davis" 
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Emily Davis</p>
                  <div className="flex items-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I love that I can see the exact fare before requesting a ride. The drivers have always been friendly and the cars are comfortable. RideX is my go-to ride service!"
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-4 py-20 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to experience RideX?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join millions of riders and drivers who choose RideX every day. Get started with just a few taps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login?type=rider"
                className="px-6 py-3 rounded-lg bg-white text-primary text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                Sign up as a rider
              </Link>
              <Link
                to="/login?type=driver"
                className="px-6 py-3 rounded-lg bg-transparent text-white text-lg font-medium border border-white hover:bg-white/10 transition-colors"
              >
                Become a driver
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Products</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ride</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Drive</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Deliver</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Business</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400">&copy; {new Date().getFullYear()} RideX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
