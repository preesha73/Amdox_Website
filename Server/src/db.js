// In Server/src/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    // Resolve Mongo URI from env or fall back to local dev
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set. Falling back to local mongodb://127.0.0.1:27017/jobportal');
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;