
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const ProfileSection = ({ user, logout, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicle: user?.vehicle || { make: '', model: '', year: '', color: '', licensePlate: '' }
  });
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };
  
  const isDriver = user?.userType === 'driver';
  
  // Create avatar URL
  const avatarUrl = user?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
    : 'https://ui-avatars.com/api/?name=User&background=random';
    
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-shrink-0">
            <img 
              src={user?.avatar || avatarUrl}
              alt={user?.name || 'User'}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {user?.userType === 'driver' ? 'Driver' : 'Rider'}
              </span>
              {user?.isOnline && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Online
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!isEditing ? (
          <div className="mt-8 space-y-6">
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                    {user?.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                    {user?.email || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                    {user?.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Date Joined
                  </label>
                  <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            {isDriver && (
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vehicle Make
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicle?.make || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vehicle Model
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicle?.model || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Year
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicle?.year || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      License Plate
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicle?.licensePlate || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Color
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicle?.color || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vehicle Type
                    </label>
                    <div className="px-3 py-2 border border-input rounded-lg bg-muted/50">
                      {user?.vehicleType?.charAt(0).toUpperCase() + user?.vehicleType?.slice(1) || 'Economy'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-border">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>
            </div>
            
            {isDriver && (
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vehicle Make
                    </label>
                    <input 
                      type="text"
                      name="vehicle.make"
                      value={formData.vehicle.make}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vehicle Model
                    </label>
                    <input 
                      type="text"
                      name="vehicle.model"
                      value={formData.vehicle.model}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Year
                    </label>
                    <input 
                      type="number"
                      name="vehicle.year"
                      value={formData.vehicle.year}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      License Plate
                    </label>
                    <input 
                      type="text"
                      name="vehicle.licensePlate"
                      value={formData.vehicle.licensePlate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Color
                    </label>
                    <input 
                      type="text"
                      name="vehicle.color"
                      value={formData.vehicle.color}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;