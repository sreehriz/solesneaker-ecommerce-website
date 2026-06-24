import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      return setError('Please fill in all fields.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle} className="app-container flex-center">
      <div className="neon-glow-bg-left"></div>
      <div className="neon-glow-bg-right"></div>

      <div className="glass-panel" style={formWrapperStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={iconBoxStyle} className="flex-center animate-pulse-glow">
            <Sparkles size={24} color="var(--neon-pink)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '15px' }}>Join SOLEFORCE</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            Register your locker to unlock smart checkout features.
          </p>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> Full Name
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Password
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-neon-pink" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Securing Account...' : 'Create Locker'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontWeight: '600' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reuse styles from Login.jsx for consistency
const containerStyle = {
  minHeight: 'calc(100vh - 140px)',
  position: 'relative',
  paddingTop: '20px',
  paddingBottom: '60px'
};

const formWrapperStyle = {
  width: '100%',
  maxWidth: '460px',
  padding: '40px 32px',
  border: '1px solid var(--border-glass)',
  borderRadius: '24px',
};

const iconBoxStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  background: 'rgba(255, 0, 127, 0.08)',
  margin: '0 auto',
  border: '1px solid var(--border-neon-pink)'
};

const errorBannerStyle = {
  background: 'rgba(255, 0, 127, 0.1)',
  border: '1px solid var(--neon-pink)',
  color: 'var(--text-main)',
  padding: '12px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '20px',
  textAlign: 'center'
};
