const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isMock, mockDb } = require('../config/db');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user' }, // user, admin
  cart: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    size: { type: Number, required: true }
  }],
  wishlist: [{ type: String }],
  addresses: [{ type: String }]
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

// Hashing helper
const hashPassword = (password) => bcrypt.hashSync(password, 8);

// Seed users for instant runnability
const seedUsers = [
  {
    _id: 'u1',
    name: 'Admin SoleForce',
    email: 'admin@soleforce.com',
    password: hashPassword('admin123'),
    role: 'admin',
    cart: [],
    wishlist: [],
    addresses: ['Main Warehouse Node A']
  },
  {
    _id: 'u2',
    name: 'Alex Streetwear',
    email: 'user@soleforce.com',
    password: hashPassword('user123'),
    role: 'user',
    cart: [
      { productId: 'p1', quantity: 1, size: 10 }
    ],
    wishlist: ['p3'],
    addresses: ['Node D (Oak Street)', 'Node E (Broadway Ave)']
  }
];

// Initialize mockDb with seed users
mockDb.users = seedUsers.map(u => ({ ...u, createdAt: new Date() }));

// Seed function for MongoDB (called on startup)
async function seedMongoDB() {
  if (isMock()) return;
  try {
    const count = await UserModel.countDocuments();
    if (count === 0) {
      await UserModel.insertMany(seedUsers.map(u => {
        const { _id, ...rest } = u; // Let MongoDB generate ObjectIds
        return rest;
      }));
      console.log('🌱 [DB] MongoDB seeded with default users.');
    }
  } catch (err) {
    console.error('⚠️ [DB] Seeding MongoDB failed:', err.message);
  }
}

// Database-agnostic helper operations
const User = {
  findOne: async (query = {}) => {
    if (isMock()) {
      return mockDb.users.find(u => {
        for (let key in query) {
          if (query[key] !== undefined && u[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    }
    return UserModel.findOne(query);
  },

  findById: async (id) => {
    if (isMock()) {
      return mockDb.users.find(u => u._id === id) || null;
    }
    try {
      return await UserModel.findById(id);
    } catch {
      return null;
    }
  },

  create: async (data) => {
    const hashedPassword = hashPassword(data.password);
    if (isMock()) {
      const newUser = {
        _id: 'u' + (mockDb.users.length + 1),
        ...data,
        password: hashedPassword,
        role: data.role || 'user',
        cart: data.cart || [],
        wishlist: data.wishlist || [],
        addresses: data.addresses || [],
        createdAt: new Date()
      };
      mockDb.users.push(newUser);
      return newUser;
    }
    return UserModel.create({
      ...data,
      password: hashedPassword
    });
  },

  update: async (id, updates) => {
    if (isMock()) {
      const index = mockDb.users.findIndex(u => u._id === id);
      if (index !== -1) {
        mockDb.users[index] = { ...mockDb.users[index], ...updates };
        return mockDb.users[index];
      }
      return null;
    }
    return UserModel.findByIdAndUpdate(id, updates, { new: true });
  },

  seedMongoDB,
  UserModel
};

module.exports = User;
