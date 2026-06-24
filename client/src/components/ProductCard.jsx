import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product }) {
  const { user, toggleWishlist, addToCart } = useAuth();
  const isWishlisted = user?.wishlist?.includes(product._id || product.id) || false;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id || product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id || product.id, product.sizes[0] || 9, 1);
  };

  const hasLimitedEdition = product.category === 'Limited Editions';

  return (
    <div 
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
        cursor: 'pointer',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-subtle)',
        transition: 'var(--transition-smooth)',
      }}
      className="apple-product-card"
    >
      <Link to={`/product/${product._id || product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Category/Promo Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {hasLimitedEdition && (
            <span style={limitedBadgeStyle}>LIMITED</span>
          )}
          <span style={catBadgeStyle}>{product.category}</span>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist} 
          style={wishlistBtnStyle}
          className="wishlist-btn-hover"
        >
          <Heart 
            size={18} 
            color={isWishlisted ? 'var(--accent-orange)' : 'var(--text-main)'}
            fill={isWishlisted ? 'var(--accent-orange)' : 'none'} 
          />
        </button>

        {/* Image Container with Zoom effect */}
        <div style={{
          height: '210px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px'
        }} className="card-img-container">
          <img 
            src={product.image} 
            alt={product.name} 
            style={imageStyle}
            className="card-img"
          />
        </div>

        {/* Info Area */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
              {product.brand}
            </span>
            <h3 style={titleStyle} className="product-title-clamp">
              {product.name}
            </h3>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            {/* Price & Rating */}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                {formatPrice(product.price)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <Star size={11} fill="#ffb300" color="#ffb300" />
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.rating}</span>
              </div>
            </div>

            {/* Quick Add To Cart */}
            <button 
              onClick={handleAddToCart} 
              style={addToCartBtnStyle}
              className="quick-cart-btn"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>

      </Link>

      <style>{`
        .apple-product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-apple);
          border-color: rgba(0,0,0,0.15);
        }
        .card-img-container img {
          transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .apple-product-card:hover .card-img {
          transform: scale(1.08) rotate(-2deg);
        }
        .wishlist-btn-hover {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid var(--border-light) !important;
        }
        .wishlist-btn-hover:hover {
          background: rgba(255, 255, 255, 1) !important;
          transform: scale(1.1);
        }
        .quick-cart-btn {
          transition: var(--transition-fast) !important;
        }
        .quick-cart-btn:hover {
          background: var(--bg-dark) !important;
          color: var(--text-light) !important;
          border-color: var(--bg-dark) !important;
        }
        .product-title-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}

// Styling definitions
const limitedBadgeStyle = {
  background: 'var(--bg-dark)',
  color: 'var(--text-light)',
  fontSize: '9px',
  fontWeight: '800',
  padding: '3px 6px',
  borderRadius: '4px',
  letterSpacing: '0.05em'
};

const catBadgeStyle = {
  background: 'rgba(255,255,255,0.9)',
  color: 'var(--text-main)',
  fontSize: '9px',
  fontWeight: '600',
  padding: '3px 6px',
  borderRadius: '4px',
  letterSpacing: '0.02em',
  border: '1px solid var(--border-light)'
};

const wishlistBtnStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 10,
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'var(--transition-fast)'
};

const imageStyle = {
  maxWidth: '95%',
  maxHeight: '160px',
  objectFit: 'contain',
  filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.12))'
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: '700',
  marginTop: '4px',
  lineHeight: '1.25',
  color: 'var(--text-main)'
};

const addToCartBtnStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-main)',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};
