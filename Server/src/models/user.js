// In Server/src/models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Don't send password in API responses by default
  },
  role: {
    type: String,
    enum: ['JobSeeker', 'Employer'],
    default: 'JobSeeker',
  },
  profile: {
    phone: { type: String },
    location: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// This function runs before a user document is saved
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // 1. Generate a "salt" to make the hash unique
  const salt = await bcrypt.genSalt(10);
  
  // 2. Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Method to compare entered password with the hashed password in the DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;