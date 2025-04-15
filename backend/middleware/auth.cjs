const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    // console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      '2fa28f8696818392df7e4e9fef5823367a9dc25cd91ed66a126134ec8345d7833e2e49f2b82dcfbb8f272e39c2d332c715f60404f6b548c445a048c378d50500'
    );

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    req.userType = user.userType;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Authentication failed: ' + (error.message || 'Unknown error') });
  }
};

module.exports = auth;
