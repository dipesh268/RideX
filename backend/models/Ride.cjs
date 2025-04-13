const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickup: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2 && 
                 !isNaN(parseFloat(v[0])) && !isNaN(parseFloat(v[1]));
        },
        message: props => `Coordinates must be an array of [longitude, latitude] with valid numbers`
      }
    },
    address: {
      type: String,
      required: true
    }
  },
  dropoff: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length === 2;
        },
        message: props => `Coordinates must be an array of [longitude, latitude]`
      }
    },
    address: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  vehicleType: {
    type: String,
    enum: ['economy', 'premium', 'suv', 'xl', 'auto', 'bike'],
    default: 'economy'
  },
  fare: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

// Create index for geospatial queries
rideSchema.index({ "pickup.coordinates": "2dsphere" });
rideSchema.index({ "dropoff.coordinates": "2dsphere" });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
