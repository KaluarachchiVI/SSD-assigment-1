const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  picture: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find or create user
userSchema.statics.findOrCreate = async function(googleProfile) {
  try {
    let user = await this.findOne({ googleId: googleProfile.id });
    
    if (!user) {
      user = new this({
        googleId: googleProfile.id,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture
      });
      await user.save();
    } else {
      // Update last login and profile info
      user.lastLogin = new Date();
      user.name = googleProfile.name;
      user.picture = googleProfile.picture;
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw new Error(`User creation/update failed: ${error.message}`);
  }
};

module.exports = mongoose.model('User', userSchema);
