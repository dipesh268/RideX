
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth.cjs');
const User = require('../models/User.cjs');
const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body;
    
        
    console.log('Registration request received:', { name, phone, userType });

    if (!name || !phone || !password || !userType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }
    // Create new user
    const user = new User({
      name,
      phone,
      password,
      email,
      userType
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      '2fa28f8696818392df7e4e9fef5823367a9dc25cd91ed66a126134ec8345d7833e2e49f2b82dcfbb8f272e39c2d332c715f60404f6b548c445a048c378d50500',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
    console.log('User registered successfully : ',user.name)
  } catch (error) {
    console.error('Registration error:', error.message || error);
    res.status(500).json({ message: 'Server error: ' + (error.message || 'Unknown error') });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }
    
    // Find the user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      '2fa28f8696818392df7e4e9fef5823367a9dc25cd91ed66a126134ec8345d7833e2e49f2b82dcfbb8f272e39c2d332c715f60404f6b548c445a048c378d50500',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
    console.log('successfully login : ',user.name);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information
router.put('/update-user', auth, async (req, res) => { // Changed to PUT and added auth middleware
  try {
    const { name, email } = req.body;
    
    // User ID comes from auth middleware now
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    
    await user.save();
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
      }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error: ' + (error.message || 'Unknown error') });
  }
});


module.exports = router;