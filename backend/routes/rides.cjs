const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth.cjs');
const Ride = require('../models/Ride.cjs');
const User = require('../models/User.cjs');
const router = express.Router();

// Create a new ride request (rider only)
router.post('/request', auth, async (req, res) => {
  try {
    console.log('Ride request received:', req.body);
    console.log('Request user:', req.userId, req.userType);
    
    // Check if user is a rider
    if (req.userType !== 'rider') {
      return res.status(403).json({ message: 'Only riders can create ride requests' });
    }
    const { pickup, dropoff, fare, distance, duration, vehicleType, scheduledTime } = req.body;
    
    if (!pickup || !dropoff) {
      return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
    }
    
    // Validate that coordinates arrays exist and are properly formatted
    if (!pickup.coordinates || !Array.isArray(pickup.coordinates) || pickup.coordinates.length !== 2 ||
        isNaN(parseFloat(pickup.coordinates[0])) || isNaN(parseFloat(pickup.coordinates[1]))) {
      return res.status(400).json({ 
        message: 'Pickup coordinates must be an array of [longitude, latitude] with valid numbers',
        details: pickup
      });
    }
    
    if (!dropoff.coordinates || !Array.isArray(dropoff.coordinates) || dropoff.coordinates.length !== 2 ||
        isNaN(parseFloat(dropoff.coordinates[0])) || isNaN(parseFloat(dropoff.coordinates[1]))) {
      return res.status(400).json({ 
        message: 'Dropoff coordinates must be an array of [longitude, latitude] with valid numbers',
        details: dropoff
      });
    }

    // Ensure coordinates are numbers, not strings
    const pickupCoordinates = pickup.coordinates.map(coord => parseFloat(coord));
    const dropoffCoordinates = dropoff.coordinates.map(coord => parseFloat(coord));
    
    // Check if this is a scheduled ride
    const isScheduled = scheduledTime ? true : false;
    
    // Create new ride with proper coordinate format
    const ride = new Ride({
      rider: req.userId,
      pickup: {
        type: "Point",
        coordinates: pickupCoordinates,
        address: pickup.address || "Current Location"
      },
      dropoff: {
        type: "Point",
        coordinates: dropoffCoordinates,
        address: dropoff.address
      },
      fare,
      distance,
      duration,
      vehicleType: vehicleType || 'economy',
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      isScheduled
    });
    
    await ride.save();
    console.log('New ride created:', ride._id);
    
    res.status(201).json(ride);
    
  } catch (error) {
    console.error('Ride request error:', error);
    res.status(500).json({ message: 'Server error: ' + (error.message || 'Unknown error') });
  }
});

// Get available ride requests (driver only)
router.get('/available', auth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view available rides' });
    }
    
    // Get driver's current location
    const { coordinates } = req.user.currentLocation;
    
    // Find rides that are requested and not assigned to a driver
    // Sort by nearest pickup location to driver's current location
    const rides = await Ride.find({ 
      driver: null, 
      status: 'requested',
      isScheduled: false, // Only show immediate rides, not scheduled ones
      'pickup.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 10000 // 10km in meters
        }
      }
    })
    .populate('rider', 'name phone')
    .limit(10);
    
    res.json(rides);
    
  } catch (error) {
    console.error('Available rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get scheduled rides (driver only)
router.get('/scheduled', auth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view scheduled rides' });
    }
    
    // Find rides that are scheduled and not assigned to a driver
    const rides = await Ride.find({ 
      driver: null, 
      status: 'requested',
      isScheduled: true,
      scheduledTime: { $gte: new Date() } // Only future rides
    })
    .populate('rider', 'name phone')
    .sort('scheduledTime')
    .limit(20);
    
    res.json(rides);
    
  } catch (error) {
    console.error('Scheduled rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Accept a ride (driver only)
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }
    
    if (ride.driver) {
      return res.status(400).json({ message: 'Ride already accepted by another driver' });
    }
    
    // Update ride
    ride.driver = req.userId;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    
    await ride.save();
    
    res.json(ride);
    
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a ride (driver only)
router.patch('/:id/start', auth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can start rides' });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Ride must be accepted before starting' });
    }
    
    if (!ride.driver.equals(req.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this ride' });
    }
    
    // Update ride
    ride.status = 'in-progress';
    ride.startedAt = new Date();
    
    await ride.save();
    
    res.json(ride);
    
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a ride (driver only)
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    // Check if user is a driver
    if (req.userType !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can complete rides' });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.status !== 'in-progress') {
      return res.status(400).json({ message: 'Ride must be in progress before completing' });
    }
    
    if (!ride.driver.equals(req.userId)) {
      return res.status(403).json({ message: 'You are not assigned to this ride' });
    }
    
    // Update ride
    ride.status = 'completed';
    ride.completedAt = new Date();
    
    await ride.save();
    
    res.json(ride);
    
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a ride (both rider and driver)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Rider can cancel at any time if they created the ride
    // Driver can cancel only if they accepted the ride
    if (req.userType === 'rider') {
      if (!ride.rider.equals(req.userId)) {
        return res.status(403).json({ message: 'You did not create this ride' });
      }
    } else if (req.userType === 'driver') {
      if (!ride.driver || !ride.driver.equals(req.userId)) {
        return res.status(403).json({ message: 'You are not assigned to this ride' });
      }
    }
    
    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({ message: 'Cannot cancel a completed or already cancelled ride' });
    }
    
    // Update ride
    ride.status = 'cancelled';
    
    await ride.save();
    
    res.json(ride);
    
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ride history (both rider and driver)
router.get('/history', auth, async (req, res) => {
  try {
    let query;
    
    if (req.userType === 'rider') {
      // Get rides created by this rider
      query = { rider: req.userId };
    } else {
      // Get rides accepted by this driver
      query = { driver: req.userId };
    }
    
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 }) // newest first
      .populate('rider', 'name')
      .populate('driver', 'name');
    
    res.json(rides);
    
  } catch (error) {
    console.error('Ride history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific ride by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('rider', 'name phone')
      .populate('driver', 'name phone');
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    // Only allow the rider who created the ride or the assigned driver to view it
    if (!ride.rider.equals(req.userId) && 
        (!ride.driver || !ride.driver.equals(req.userId))) {
      return res.status(403).json({ message: 'You are not authorized to view this ride' });
    }
    
    res.json(ride);
    
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
