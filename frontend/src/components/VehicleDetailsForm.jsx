
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { userAPI } from '../api/api';

const VehicleDetailsForm = ({ onComplete, existingData }) => {
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    vehicleType: 'economy'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingData) {
      setVehicleData(prevData => ({
        ...prevData,
        ...existingData.vehicle,
        vehicleType: existingData.vehicleType || 'economy'
      }));
    } else {
      // First time login - get vehicle details if they exist
      const getVehicleDetails = async () => {
        try {
          const response = await userAPI.getVehicleDetails();
          if (response.data && Object.keys(response.data).length > 0) {
            setVehicleData(prevData => ({
              ...prevData,
              ...response.data.vehicle,
              vehicleType: response.data.vehicleType || 'economy'
            }));
          }
        } catch (error) {
          console.error('Error fetching vehicle details:', error);
        }
      };
      
      getVehicleDetails();
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate data
    if (!vehicleData.make || !vehicleData.model || !vehicleData.licensePlate) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await userAPI.updateVehicleDetails({
        vehicle: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: Number(vehicleData.year),
          color: vehicleData.color,
          licensePlate: vehicleData.licensePlate
        },
        vehicleType: vehicleData.vehicleType
      });

      toast.success('Vehicle details saved successfully');
      if (onComplete) onComplete(vehicleData);
    } catch (error) {
      console.error('Error saving vehicle details:', error);
      toast.error('Failed to save vehicle details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
      <p className="text-muted-foreground mb-6">
        Please provide your vehicle information to continue.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="make">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              id="make"
              name="make"
              type="text"
              value={vehicleData.make}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g., Toyota"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="model">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="model"
              name="model"
              type="text"
              value={vehicleData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g., Camry"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="year">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={vehicleData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g., 2022"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="color">
              Color
            </label>
            <input
              id="color"
              name="color"
              type="text"
              value={vehicleData.color}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g., Silver"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="licensePlate">
              License Plate <span className="text-red-500">*</span>
            </label>
            <input
              id="licensePlate"
              name="licensePlate"
              type="text"
              value={vehicleData.licensePlate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="e.g., ABC123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="vehicleType">
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={vehicleData.vehicleType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="suv">SUV</option>
              <option value="xl">XL</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2">Saving</span>
                <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full inline-block"></div>
              </>
            ) : (
              'Save Vehicle Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleDetailsForm;
