import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
            <Sparkles size={24} color="var(--neon-cyan)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '15px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            Log in to access your custom locker and order stats.
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
              <Mail size={14} /> Email Address
            </label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="alex@soleforce.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-neon-cyan" 
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Decrypting Locker...' : 'Unlock Account'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--neon-pink)', textDecoration: 'none', fontWeight: '600' }}>
            Register here
          </Link>
        </div>

        {/* Demo Credentials Helper Box */}
        <div style={demoBoxStyle}>
          <strong style={{ color: 'var(--neon-cyan)', display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔑 Developer Credentials
          </strong>
          <span style={{ display: 'block', fontSize: '13px' }}><strong>User:</strong> user@soleforce.com / user123</span>
          <span style={{ display: 'block', fontSize: '13px' }}><strong>Admin:</strong> admin@soleforce.com / admin123</span>
        </div>
      </div>
    </div>
  );
}

// Styling definitions
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
  background: 'rgba(0, 243, 255, 0.08)',
  margin: '0 auto',
  border: '1px solid var(--border-neon-cyan)'
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

const demoBoxStyle = {
  marginTop: '30px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-glass)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: 'var(--text-muted)'
};
