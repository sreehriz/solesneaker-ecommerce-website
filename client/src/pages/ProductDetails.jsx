import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Heart, Star, ShoppingBag, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function ProductDetails() {
  const { id } = useParams();
  const { user, addToCart, toggleWishlist } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedPopup, setAddedPopup] = useState(false);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const data = await api.products.get(id);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]); // default to first size
        }
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductDetails();
  }, [id]);

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product._id || product.id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) return alert('Please select a sneaker size.');
    
    addToCart(product._id || product.id, selectedSize, 1);
    setAddedPopup(true);
    setTimeout(() => setAddedPopup(false), 3000);
  };

  const isWishlisted = user?.wishlist?.includes(product?._id || product?.id) || false;

  if (loading) {
    return (
      <div className="app-container flex-center" style={{ minHeight: '60vh' }}>
        <span className="gradient-text-pink-cyan animate-pulse-glow" style={{ fontSize: '20px', fontWeight: '700' }}>
          Opening Vault Case...
        </span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--neon-pink)' }}>Locker Retrieval Error</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>{error || 'This sneaker does not exist in our inventory.'}</p>
        <Link to="/shop" style={{ textDecoration: 'none' }}>
          <button className="btn-neon-cyan" style={{ marginTop: '20px' }}>Back to Shop</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingBottom: '80px', position: 'relative' }}>
      <div className="neon-glow-bg-left"></div>
      <div className="neon-glow-bg-right"></div>

      {/* Back button */}
      <Link to="/shop" style={backLinkStyle}>
        <ArrowLeft size={16} /> Back to Inventory
      </Link>

      <main style={gridStyle}>
        {/* Left column: Image showcase */}
        <section className="glass-panel animate-float" style={imageShowcaseStyle}>
          <div style={glowBgStyle}></div>
          <img 
            src={product.image} 
            alt={product.name} 
            style={imageStyle} 
          />
        </section>

        {/* Right column: Specs and options */}
        <section style={detailsWrapperStyle}>
          <div>
            {/* Brand */}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              {product.brand}
            </span>
            
            {/* Title */}
            <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.1', marginTop: '6px' }}>
              {product.name}
            </h1>

            {/* Category tag */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <span style={categoryTagStyle}>{product.category}</span>
              <span style={{ color: product.stock > 0 ? 'var(--neon-cyan)' : 'var(--neon-pink)', fontSize: '13px', fontWeight: '600' }}>
                {product.stock > 0 ? `IN STOCK (${product.stock} units)` : 'OUT OF STOCK'}
              </span>
            </div>
            
            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '15px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating) ? 'var(--neon-cyan)' : 'none'} 
                    color="var(--neon-cyan)" 
                  />
                ))}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{product.rating} / 5.0</span>
            </div>

            {/* Search Hit Counter (Using OBST frequencies data) */}
            <div style={searchHitsStyle}>
              <Activity size={14} color="var(--neon-cyan)" />
              <span>Keyword lookup frequency: <strong style={{ color: 'var(--text-main)' }}>{product.searchCount || 0}</strong> views</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-glass)', margin: '30px 0' }} />

          {/* Price */}
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</span>
            <div style={{ fontSize: '38px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginTop: '4px' }}>
              {formatPrice(product.price)}
            </div>
          </div>

          {/* Size Selector */}
          <div style={{ marginTop: '30px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Select US Men's Size
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="size-btn-hover"
                  style={{
                    ...sizeBtnStyle,
                    ...(selectedSize === size ? activeSizeBtnStyle : {})
                  }}
                >
                  US {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <button 
              onClick={handleAddToCart}
              className="btn-neon-pink" 
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={product.stock <= 0}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button 
              onClick={handleWishlist}
              style={{
                ...wishlistBtnStyle,
                borderColor: isWishlisted ? 'var(--neon-pink)' : 'var(--border-glass)',
                background: isWishlisted ? 'rgba(255, 0, 127, 0.05)' : 'rgba(255,255,255,0.02)'
              }}
              title="Add to Wishlist"
            >
              <Heart size={20} color={isWishlisted ? 'var(--neon-pink)' : 'currentColor'} fill={isWishlisted ? 'var(--neon-pink)' : 'none'} />
            </button>
          </div>

          {/* Notification popup */}
          {addedPopup && (
            <div style={popupStyle} className="animate-pulse-glow">
              🎉 Added to cart! US Men's Size {selectedSize}
            </div>
          )}

          {/* Description */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-main)' }}>
              Release Concept
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginTop: '10px' }}>
              {product.description}
            </p>
          </div>

          {/* Authentic Guarantee */}
          <div className="glass-panel" style={guaranteeStyle}>
            <ShieldCheck size={20} color="var(--neon-cyan)" />
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>100% Authenticity Verified</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Every item is catalogued and physically inspected by expert authenticators before dispatch.
              </p>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .size-btn-hover {
          transition: var(--transition-fast) !important;
        }
        .size-btn-hover:hover {
          border-color: var(--neon-cyan) !important;
          color: var(--text-main) !important;
        }
      `}</style>
    </div>
  );
}

// Styling definitions
const backLinkStyle = {
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '30px',
  transition: 'var(--transition-fast)'
};

const gridStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '50px',
  alignItems: 'flex-start'
};

const imageShowcaseStyle = {
  flex: '1 1 450px',
  height: '500px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  border: '1px solid var(--border-glass)',
  borderRadius: '24px',
  background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)'
};

const glowBgStyle = {
  position: 'absolute',
  width: '300px',
  height: '300px',
  background: 'radial-gradient(circle, rgba(0, 243, 255, 0.08) 0%, rgba(0,0,0,0) 70%)',
  zIndex: 1
};

const imageStyle = {
  maxWidth: '85%',
  maxHeight: '380px',
  objectFit: 'contain',
  filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.6))',
  zIndex: 2,
  transform: 'rotate(-8deg)'
};

const detailsWrapperStyle = {
  flex: '1 1 450px',
  display: 'flex',
  flexDirection: 'column'
};

const categoryTagStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid var(--border-glass)',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: '600'
};

const searchHitsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: 'var(--text-muted)',
  background: 'rgba(0, 243, 255, 0.03)',
  border: '1px solid rgba(0, 243, 255, 0.1)',
  borderRadius: '6px',
  padding: '6px 12px',
  marginTop: '15px',
  width: 'max-content'
};

const sizeBtnStyle = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-muted)',
  width: '70px',
  height: '45px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const activeSizeBtnStyle = {
  border: '1px solid var(--neon-cyan)',
  color: 'var(--text-main)',
  background: 'rgba(0, 243, 255, 0.08)',
  boxShadow: '0 0 10px rgba(0, 243, 255, 0.15)'
};

const wishlistBtnStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-main)',
  transition: 'var(--transition-fast)'
};

const popupStyle = {
  position: 'fixed',
  bottom: '40px',
  right: '40px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--neon-cyan)',
  color: 'var(--text-main)',
  padding: '16px 24px',
  borderRadius: '12px',
  zIndex: 100,
  fontWeight: '600',
  boxShadow: 'var(--glow-cyan)'
};

const guaranteeStyle = {
  marginTop: '30px',
  padding: '20px',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.01)'
};
