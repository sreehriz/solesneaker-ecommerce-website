import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Heart, LogOut, Menu, X, Download } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
  };

  const cartItemCount = user?.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '12px',
      margin: '0 24px 24px 24px',
      zIndex: 100,
      borderRadius: '12px',
      border: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'blur(20px)',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
      }}>
        {/* Brand Name */}
        <Link to="/" style={{
          textDecoration: 'none',
          fontSize: '22px',
          fontWeight: '900',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-main)'
        }}>
          SOLEFORCE<span style={{ color: 'var(--accent-orange)' }}>.</span>
        </Link>

        {/* Desktop Menu */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '32px'
        }} className="desktop-menu-flex">
          <Link to="/" className="nav-link" style={{
            ...navLinkStyle,
            color: isActive('/') ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: isActive('/') ? '600' : '500'
          }}>
            Home
          </Link>
          <Link to="/shop" className="nav-link" style={{
            ...navLinkStyle,
            color: isActive('/shop') ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: isActive('/shop') ? '600' : '500'
          }}>
            Shop
          </Link>
          <Link to="/analytics" className="nav-link" style={{
            ...navLinkStyle,
            color: isActive('/analytics') ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: isActive('/analytics') ? '600' : '500'
          }}>
            Engine Dashboard
          </Link>

          {user && (
            <Link to="/orders" className="nav-link" style={{
              ...navLinkStyle,
              color: isActive('/orders') ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isActive('/orders') ? '600' : '500'
            }}>
              My Orders
            </Link>
          )}
        </div>

        {/* Actions Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="quick-cart-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-light)',
                border: 'none',
                borderRadius: '16px',
                marginRight: '8px'
              }}
            >
              <Download size={13} color="var(--accent-orange)" /> Install App
            </button>
          )}
          {user ? (
            <>
              {/* Wishlist Link */}
              <Link to="/wishlist" style={iconStyle} title="Wishlist">
                <Heart 
                  size={20} 
                  color={user.wishlist.length > 0 ? 'var(--accent-orange)' : 'var(--text-main)'} 
                  fill={user.wishlist.length > 0 ? 'var(--accent-orange)' : 'none'} 
                  style={{ transition: 'var(--transition-fast)' }}
                />
              </Link>
              
              {/* Cart Link with Badge */}
              <Link to="/cart" style={{ ...iconStyle, position: 'relative' }} title="Shopping Cart">
                <ShoppingBag size={20} color={isActive('/cart') ? 'var(--accent-orange)' : 'var(--text-main)'} />
                {cartItemCount > 0 && (
                  <span style={badgeStyle}>{cartItemCount}</span>
                )}
              </Link>

              {/* User Greeting & Logout */}
              <div style={{ display: 'none', alignItems: 'center', gap: '15px' }} className="desktop-menu-flex">
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Hi, <strong style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user.name.split(' ')[0]}</strong>
                </span>
                <button onClick={handleLogout} style={logoutBtnStyle} title="Log Out">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-neon-cyan" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '18px' }}>
                Join SoleForce
              </button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} style={mobileMenuBtnStyle} className="mobile-menu-toggle">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={mobileDrawerStyle}>
          {deferredPrompt && (
            <button 
              onClick={() => { handleInstallClick(); setIsOpen(false); }}
              style={{
                ...mobileNavLinkStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                textAlign: 'left',
                background: 'rgba(255, 85, 0, 0.08)',
                color: 'var(--accent-orange)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
                padding: '10px 12px',
                borderRadius: '8px'
              }}
            >
              <Download size={15} /> Install Sneakers App
            </button>
          )}
          <Link to="/" onClick={() => setIsOpen(false)} style={{ ...mobileNavLinkStyle, color: isActive('/') ? 'var(--accent-orange)' : 'var(--text-main)' }}>Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} style={{ ...mobileNavLinkStyle, color: isActive('/shop') ? 'var(--accent-orange)' : 'var(--text-main)' }}>Shop</Link>
          <Link to="/analytics" onClick={() => setIsOpen(false)} style={{ ...mobileNavLinkStyle, color: isActive('/analytics') ? 'var(--accent-orange)' : 'var(--text-main)' }}>Engine Dashboard</Link>
          {user && (
            <>
              <Link to="/orders" onClick={() => setIsOpen(false)} style={{ ...mobileNavLinkStyle, color: isActive('/orders') ? 'var(--accent-orange)' : 'var(--text-main)' }}>My Orders</Link>
              <Link to="/wishlist" onClick={() => setIsOpen(false)} style={mobileNavLinkStyle}>Wishlist ({user.wishlist.length})</Link>
              <Link to="/cart" onClick={() => setIsOpen(false)} style={mobileNavLinkStyle}>Cart ({cartItemCount})</Link>
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Logged in as {user.name}</span>
                <button onClick={handleLogout} style={logoutBtnStyle}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Injecting CSS Media Queries directly into document for standard responsiveness */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu-flex {
            display: flex !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
        }
        .nav-link:hover {
          color: var(--text-main) !important;
        }
      `}</style>
    </nav>
  );
}

// Styling definitions
const navLinkStyle = {
  textDecoration: 'none',
  fontSize: '14px',
  letterSpacing: '-0.01em',
  transition: 'var(--transition-fast)',
  cursor: 'pointer'
};

const iconStyle = {
  color: 'var(--text-main)',
  textDecoration: 'none',
  transition: 'var(--transition-fast)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const badgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  background: 'var(--accent-orange)',
  color: 'var(--text-light)',
  fontSize: '9px',
  fontWeight: '800',
  borderRadius: '50%',
  width: '15px',
  height: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoutBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px',
  borderRadius: '6px',
  fontSize: '13px',
  transition: 'var(--transition-fast)'
};

const mobileMenuBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-main)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
};

const mobileDrawerStyle = {
  background: 'var(--bg-primary)',
  borderTop: '1px solid var(--border-light)',
  borderRadius: '0 0 12px 12px',
  padding: '12px 24px 20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const mobileNavLinkStyle = {
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  padding: '8px 12px',
  borderRadius: '6px',
  transition: 'var(--transition-fast)'
};
