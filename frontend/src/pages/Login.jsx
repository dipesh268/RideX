import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('rider');
  const [loading, setLoading] = useState(false);
  
  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for userType in URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam && ['rider', 'driver'].includes(typeParam)) {
      setUserType(typeParam);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.userType === 'rider') {
        navigate('/rider');
      } else {
        navigate('/driver');
      }
    }
  }, [currentUser, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!phone || !password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setLoading(true);
      
      try {
        const user = await login({ phone, password });
        if (user.userType === 'rider') {
          navigate('/rider');
        } else {
          navigate('/driver');
        }
      } catch (error) {
        setLoading(false);
      }
    } else {
      if (!name || !phone || !password) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      setLoading(true);
      
      try {
        const user = await register({
          name,
          phone,
          password,
          email,
          userType
        });
        
        if (user.userType === 'rider') {
          navigate('/rider');
        } else {
          navigate('/driver/vehicle_details');
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-accent/50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">
            {isLogin ? "Sign in to RideX" : "Create your RideX account"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isLogin ? "Enter your credentials to access your account" : "Fill in your information to create an account"}
          </p>
        </div>
        
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden animate-scale-in">
          <div className="p-6">
            <div className="flex border border-border rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-colors ${
                  userType === 'rider'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setUserType('rider')}
                disabled={isLogin}
              >
                Rider
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-colors ${
                  userType === 'driver'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setUserType('driver')}
                disabled={isLogin}
              >
                Driver
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name*
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number*
                </label>
                <input
                  id="phone"
                  type="tel"
                  pattern='[789][0-9]{9}'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
                  Password*
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                    Email Address (optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? "Signing in" : "Creating Account"}
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;