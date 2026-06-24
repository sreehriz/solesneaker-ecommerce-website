const mongoose = require('mongoose');

let isMock = false;

// In-memory mock database collections
const mockDb = {
  users: [],
  products: [],
  orders: [],
  searchLogs: {}
};

async function connectDB() {
  if (process.env.DB_TYPE === 'memory') {
    console.log('⚠️  [DB] Forcing In-Memory Database mode.');
    isMock = true;
    return;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soleforce';
  
  try {
    // Set connection timeout to 4 seconds to fail fast if no local MongoDB is running
    mongoose.set('bufferCommands', false); // Disable buffering so operations fail immediately if not connected
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000, 
    });
    console.log('🚀 [DB] MongoDB Connected successfully.');
  } catch (err) {
    console.error(`⚠️  [DB] MongoDB Connection failed: ${err.message}`);
    console.log('🔮 [DB] Falling back to In-Memory Database mode. Changes will not persist after server restart.');
    isMock = true;
  }
}

module.exports = {
  connectDB,
  isMock: () => isMock,
  mockDb
};
