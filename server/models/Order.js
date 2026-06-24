const mongoose = require('mongoose');
const { isMock, mockDb } = require('../config/db');

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: Number, required: true }
  }],
  shippingAddress: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  deliveryRoute: { type: [String], required: true },
  status: { type: String, required: true, default: 'Pending' }, // Pending, Shipped, Delivered
  invoiceCompressed: { type: String } // Huffman coding output
}, { timestamps: true });

const OrderModel = mongoose.model('Order', OrderSchema);

// Database-agnostic helper operations
const Order = {
  find: async (query = {}) => {
    if (isMock()) {
      return mockDb.orders.filter(o => {
        for (let key in query) {
          if (query[key] !== undefined && o[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }
    return OrderModel.find(query).sort({ createdAt: -1 });
  },

  findById: async (id) => {
    if (isMock()) {
      return mockDb.orders.find(o => o._id === id) || null;
    }
    try {
      return await OrderModel.findById(id);
    } catch {
      return null;
    }
  },

  create: async (data) => {
    if (isMock()) {
      const newOrder = {
        _id: 'o' + (mockDb.orders.length + 1),
        ...data,
        status: data.status || 'Pending',
        createdAt: new Date()
      };
      mockDb.orders.push(newOrder);
      return newOrder;
    }
    return OrderModel.create(data);
  },

  updateStatus: async (id, status) => {
    if (isMock()) {
      const order = mockDb.orders.find(o => o._id === id);
      if (order) {
        order.status = status;
      }
      return order;
    }
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true });
  },

  OrderModel
};

module.exports = Order;
