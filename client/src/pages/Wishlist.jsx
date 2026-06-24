import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const allProducts = await api.products.list();
        const filtered = allProducts.filter(p => 
          user.wishlist.includes(p._id || p.id)
        );
        setWishlistItems(filtered);
      } catch (err) {
        console.error('Failed to load wishlist items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [user?.wishlist]);

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Wishlist Sealed</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Please log in to view your wishlisted cargo.</p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-neon-cyan" style={{ marginTop: '20px' }}>Login</button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container flex-center" style={{ minHeight: '60vh' }}>
        <span className="gradient-text-pink-cyan animate-pulse-glow" style={{ fontSize: '20px', fontWeight: '700' }}>
          Scanning Wishlist Records...
        </span>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingBottom: '80px', position: 'relative' }}>
      <div className="neon-glow-bg-left"></div>
      <div className="neon-glow-bg-right"></div>

      <header style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          YOUR SAVED GEAR
        </span>
        <h1 style={{ fontSize: '40px', fontWeight: '800', marginTop: '5px' }}>MY WISHLIST</h1>
      </header>

      {wishlistItems.length === 0 ? (
        <section className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', border: '1px solid var(--border-glass)' }}>
          <Heart size={48} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
          <h3>Your wishlist is empty.</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Save items from our catalog to monitor drops.</p>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <button className="btn-neon-cyan" style={{ marginTop: '20px' }}>Browse Releases</button>
          </Link>
        </section>
      ) : (
        <div className="grid-products">
          {wishlistItems.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
