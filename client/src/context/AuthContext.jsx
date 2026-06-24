import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('soleforce_token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('soleforce_token');
    setToken(null);
    setUser(null);
  };

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('soleforce_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.auth.register({ name, email, password });
    localStorage.setItem('soleforce_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };


  // Cart operations
  const addToCart = async (productId, size, quantity = 1) => {
    if (!user) return alert('Please log in to add items to your cart.');
    
    // Check if item already exists in cart with same size
    const existingIndex = user.cart.findIndex(
      item => item.productId === productId && item.size === size
    );

    let newCart = [...user.cart];
    if (existingIndex !== -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ productId, size, quantity });
    }

    // Update locally and sync to database
    setUser(prev => ({ ...prev, cart: newCart }));
    try {
      await api.auth.updateCart(newCart);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  const removeFromCart = async (productId, size) => {
    if (!user) return;
    const newCart = user.cart.filter(
      item => !(item.productId === productId && item.size === size)
    );
    setUser(prev => ({ ...prev, cart: newCart }));
    try {
      await api.auth.updateCart(newCart);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  const updateCartQty = async (productId, size, quantity) => {
    if (!user || quantity <= 0) return;
    const newCart = user.cart.map(item => 
      (item.productId === productId && item.size === size) ? { ...item, quantity } : item
    );
    setUser(prev => ({ ...prev, cart: newCart }));
    try {
      await api.auth.updateCart(newCart);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  const clearCart = () => {
    if (user) {
      setUser(prev => ({ ...prev, cart: [] }));
    }
  };

  // Wishlist operations
  const toggleWishlist = async (productId) => {
    if (!user) return alert('Please log in to update your wishlist.');
    const inWishlist = user.wishlist.includes(productId);
    let newWishlist;
    if (inWishlist) {
      newWishlist = user.wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...user.wishlist, productId];
    }

    setUser(prev => ({ ...prev, wishlist: newWishlist }));
    try {
      await api.auth.updateWishlist(newWishlist);
    } catch (err) {
      console.error('Wishlist sync failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      toggleWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
