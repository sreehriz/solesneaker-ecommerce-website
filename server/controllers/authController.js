const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_neon_sneaker_jwt_key_1337';

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password });
    
    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        addresses: user.addresses
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        addresses: user.addresses
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cart: user.cart,
      wishlist: user.wishlist,
      addresses: user.addresses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCart(req, res) {
  try {
    const { cart } = req.body; // array of {productId, quantity, size}
    const updatedUser = await User.update(req.user.id, { cart });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ cart: updatedUser.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateWishlist(req, res) {
  try {
    const { wishlist } = req.body; // array of productIds
    const updatedUser = await User.update(req.user.id, { wishlist });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ wishlist: updatedUser.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateCart,
  updateWishlist
};
