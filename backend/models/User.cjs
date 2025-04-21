const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['rider', 'driver'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  HomeAddr: {
    type: String,
    trim: true
  },
  DOB:{
    type: Date,
  },
  pincode:{
    type:String,
    trim:true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      type: String,
      default: ''
    }
  },
  // Driver specific fields
  vehicleType: {
    type: String,
    enum: ['economy', 'premium', 'suv', 'xl'],
    default: 'economy'
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    color: String
  },
  // Rider specific fields
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'upi', 'cash'],
      default: 'cash'
    },
    default: {
      type: Boolean,
      default: false
    },
    details: {
      cardNumber: String,
      expiryDate: String,
      upiId: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geospatial queries
userSchema.index({ "currentLocation": "2dsphere" });
userSchema.index({ "phone": 1 }, { unique: true });

// Hash password before saving (if password exists)
userSchema.pre('save', async function(next) {
  if (this.password && this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// Method to convert user to JSON (remove password)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
