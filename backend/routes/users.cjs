
const express = require('express');
const auth = require('../middleware/auth.cjs');
const User = require('../models/User.cjs');
const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user location
router.patch('/location', auth, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid location format' });
    }
    
    const user = await User.findById(req.userId);
    
    user.currentLocation = {
      type: 'Point',
      coordinates,
      address: address || user.currentLocation.address
    };
    
    await user.save();
    
    res.json({ currentLocation: user.currentLocation });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle online status (for drivers)
router.patch('/status', auth, async (req, res) => {
  try {
    // Only drivers can toggle online status
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can change online status' });
    }
    
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status format' });
    }
    
    const user = await User.findById(req.userId);
    user.isOnline = isOnline;
    
    await user.save();
    
    res.json({ isOnline: user.isOnline });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby drivers (for riders)
router.get('/nearby-drivers', auth, async (req, res) => {
  try {
    // Only riders can search for drivers
    if (req.userType !== 'rider') {
      return res.status(403).json({ message: 'Only riders can search for drivers' });
    }
    
    const user = await User.findById(req.userId);
    
    // Search for drivers within 10 km
    const drivers = await User.find({
      userType: 'driver',
      isOnline: true,
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.currentLocation.coordinates
          },
          $maxDistance: 10000 // 10km in meters
        }
      }
    }).select('-password').limit(10);
    
    res.json(drivers);
  } catch (error) {
    console.error('Nearby drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/vehicle_details', async (req, res) => {
  const userId = req.userId || req.body.userId; // adjust based on how you're passing user info (JWT recommended)
  const { vehicle, vehicleType } = req.body;

  if (!vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate) {
    return res.status(400).json({ message: 'Missing required vehicle fields' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update vehicle details
    user.vehicle = vehicle;
    user.vehicleType = vehicleType;
    await user.save();

    res.status(200).json({ message: 'Vehicle details updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
