
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Shield, Save, LogOut, Calendar,Home  } from 'lucide-react';

const RiderProfile = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateUser(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    toast.success('You have been logged out successfully');
    navigate('/');
  };
  
  if (!currentUser) {
    navigate('/login?type=rider');
    return null;
  }
  
  return (
    <div className="container py-6 px-4 mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                alt={currentUser.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.email || currentUser.phone}</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Rider
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Verified
                </span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Add email address"
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Pin Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your Pin code"
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  DOB
                </label>
                <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="date"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your Birth Date"
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Home Address
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your home address"
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          
            {/* <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive emails about your rides and promotions</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                    <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-6" htmlFor="toggle-1"></label>
                    <input type="checkbox" id="toggle-1" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" defaultChecked />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive text messages about your ride status</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                    <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-0" htmlFor="toggle-2"></label>
                    <input type="checkbox" id="toggle-2" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme for the app interface</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-muted">
                    <label className="absolute left-0 inline-block w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-lg cursor-pointer translate-x-0" htmlFor="toggle-3"></label>
                    <input type="checkbox" id="toggle-3" className="w-full h-full opacity-0 absolute rounded-full cursor-pointer" />
                  </div>
                </div>
              </div>
            </div> */}
            
            <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 flex-1"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button"
                variant="destructive"
                className="flex items-center justify-center gap-2 flex-1"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
