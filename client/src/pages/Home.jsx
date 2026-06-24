import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import RotatingBanner from '../components/RotatingBanner';
import { ArrowRight, Package, Truck, Star } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 360 Rotation References
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const stateRef = useRef({
    currentIndex: 0,
    targetIndex: 0,
    isHovering: false,
    autoRotateSpeed: 0.1, // rotation speed per frame
  });
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const products = await api.products.list();
        setFeaturedProducts(products.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Handle fullscreen resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const renderFrame = () => {
      const state = stateRef.current;
      const images = imagesRef.current;

      // Continuous slow rotation if user is not dragging/moving mouse
      if (!state.isHovering) {
        state.targetIndex = (state.targetIndex + state.autoRotateSpeed) % 100;
      }

      // Smooth interpolation
      let diff = state.targetIndex - state.currentIndex;
      if (!state.isHovering) {
        // Wrap diff to shortest path in 360 circular list (100 frames)
        if (diff < -50) diff += 100;
        if (diff > 50) diff -= 100;
      }
      state.currentIndex = (state.currentIndex + diff * 0.08 + 100) % 100;

      const frameIdx = Math.floor(state.currentIndex);
      const img = images[frameIdx];

      if (img && img.complete && img.naturalWidth !== 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // COVER-SCALE math (fills screen properly like background cover)
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );

        const w = img.width * scale;
        const h = img.height * scale;

        // Position on desktop (centered on the canvas + right offset)
        // Position on mobile (fully centered)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const offsetX = window.innerWidth > 900 ? 80 * dpr : 0;
        const x = canvas.width / 2 - w / 2 + offsetX;
        const y = canvas.height / 2 - h / 2;

        context.drawImage(img, x, y, w, h);
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    // Preload all 100 frames
    const frameCount = 100;
    const images = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/banner/frame_${frameNum}.png`;
      images.push(img);
    }
    imagesRef.current = images;

    // Start rendering
    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    stateRef.current.targetIndex = percent * 99;
    stateRef.current.isHovering = true;

    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      stateRef.current.isHovering = false;
    }, 2500); // Resume auto-rotation after 2.5 seconds of inactivity
  };

  const handleMouseEnter = () => {
    stateRef.current.isHovering = true;
  };

  const handleMouseLeave = () => {
    stateRef.current.isHovering = false;
  };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — 100vh, no sticky tricks, always visible
          Scroll animation: as hero exits viewport, shoe rotates.
          ═══════════════════════════════════════════════════════════ */}
      <section 
        className="home-hero"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fullscreen Canvas Background */}
        <canvas ref={canvasRef} id="shoeCanvas" className="home-hero__canvas" />

        {/* Background ambient orbs */}
        <div className="hero-orb hero-orb--r" />
        <div className="hero-orb hero-orb--l" />

        {/* Floating Text content */}
        <div className="home-hero__text">
          {/* Live badge */}
          <div className="hero-live-badge">
            <span className="hero-live-badge__dot" />
            <span>DROP 01 LIVE</span>
          </div>

          <h1 className="home-hero__h1">
            STEP INTO{' '}<br />
            THE FUTURE{' '}<br />
            <span style={{ color: 'var(--accent-orange)' }}>OF SOLE.</span>
          </h1>

          <p className="home-hero__sub">
            A curated high-performance sneaker vault powered by optimized Java
            algorithms. Engineering meets street culture.
          </p>

          <div className="home-hero__actions">
            <Link to="/shop" style={{ textDecoration: 'none' }}>
              <button className="btn-neon-pink home-hero__cta">
                Shop Collection <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </button>
            </Link>
            <Link to="/shop" className="home-hero__link">
              View All Releases <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-hero__scroll-hint">
            <span className="home-hero__scroll-line" />
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. Why SOLEFORCE — Brand Features Section (Dark)
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-light)', padding: '100px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          <div style={{ maxWidth: '600px', marginBottom: '60px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              WHY SOLEFORCE
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '8px', color: 'var(--text-light)' }}>
              ENGINEERED FOR <br />THE CULTURE.
            </h2>
            <p style={{ color: '#86868b', fontSize: '16px', lineHeight: '1.6', marginTop: '16px' }}>
              Every feature is built for sneakerheads — from instant search and smart sorting
              to budget-aware recommendations and optimized delivery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: <Star size={24} color="var(--accent-orange)" />,
                title: 'Smart Recommendations',
                body: 'Budget-aware suggestions find the best combination of sneakers within your price range, maximizing value on every order.'
              },
              {
                icon: <Truck size={24} color="var(--accent-orange)" />,
                title: 'Optimized Delivery',
                body: 'Our routing engine maps the fastest path from warehouse to your door, cutting shipping time and ensuring timely drops.'
              },
              {
                icon: <Package size={24} color="var(--accent-orange)" />,
                title: 'Instant Search & Sort',
                body: 'Lightning-fast product search and stable price/rating sorting keep you finding the right pair in milliseconds.'
              },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ padding: '32px', backgroundColor: 'var(--bg-dark-secondary)', border: '1px solid var(--border-dark)', borderRadius: '12px' }}>
                <div style={{ marginBottom: '16px' }}>{icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-light)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#86868b', fontSize: '14px', lineHeight: '1.5' }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Link to="/shop" style={{ textDecoration: 'none', color: 'var(--text-light)', fontWeight: '600', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Browse Full Collection <ArrowRight size={14} style={{ color: 'var(--accent-orange)' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. Featured Vault — Light Section
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '100px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase' }}>CURATED RELEASE</span>
              <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.03em', textTransform: 'uppercase', marginTop: '6px' }}>
                THE FEATURED VAULT
              </h2>
            </div>
            <Link to="/shop" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <span className="animate-pulse-glow" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                ACCESSING INVENTORY...
              </span>
            </div>
          ) : (
            <div className="grid-products">
              {featuredProducts.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. Design Ethos — Dark Secondary Section
          ═══════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--bg-dark-secondary)', color: 'var(--text-light)', padding: '100px 0', borderTop: '1px solid var(--border-dark)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/images/Nike Air Force 1 Low.jpeg"
              alt="Hype Streetwear Collection"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '420px', objectFit: 'contain', borderRadius: '12px', boxShadow: 'var(--shadow-nike)' }}
            />
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase' }}>DESIGN ETHOS</span>
            <h2 style={{ fontSize: '38px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '8px', color: 'var(--text-light)' }}>
              MINIMAL OUTLINE. <br />MAXIMUM ENERGY.
            </h2>
            <p style={{ color: '#86868b', fontSize: '16px', lineHeight: '1.6', marginTop: '20px', marginBottom: '32px' }}>
              We follow a hybrid Nike x Apple approach. Apple dictates our clean geometry, hairline alignments,
              and zero-clutter layouts. Nike fuels our raw, uppercase messaging and product-first zoom visuals.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { num: '01', title: 'No Placeholders', body: 'Real, high-definition photography representing the pinnacle of sneaker drops.' },
                { num: '02', title: 'Pure Mathematics', body: 'Our analytical modules run real-time algorithms (Optimal BSTs, Matrix Chain Multiplications) to scale layout structures.' },
              ].map(({ num, title, body }) => (
                <div key={num} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '16px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-light)', width: '40px', flexShrink: 0 }}>{num}</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-light)' }}>{title}</h4>
                    <p style={{ color: '#86868b', fontSize: '13px', marginTop: '4px' }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOME-SCOPED STYLES
          ═══════════════════════════════════════════════════════════ */}
      <style>{`
        .home-hero {
          position: relative;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: #000;
          color: var(--text-light);
        }

        /* ── Readability Gradient Overlay ── */
        .home-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.85) 15%,
            rgba(0,0,0,0.4) 40%,
            rgba(0,0,0,0.1) 70%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 3; /* sits above canvas, behind text */
        }

        /* ── Fullscreen Background Canvas ── */
        .home-hero__canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        /* ── Floating Text content ── */
        .home-hero__text {
          position: absolute;
          top: 50%;
          left: 6vw;
          transform: translateY(-50%);
          z-index: 5;
          max-width: 500px;
          color: white;
        }

        .home-hero__h1 {
          font-size: clamp(3rem, 5vw, 5rem);
          line-height: 1.05;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.03em;
          color: var(--text-light);
          margin-bottom: 22px;
        }

        .home-hero__sub {
          margin-top: 20px;
          font-size: 17px;
          color: #a1a1a6;
          line-height: 1.65;
          max-width: 420px;
          margin-bottom: 34px;
          opacity: 0.8;
        }

        .home-hero__actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .home-hero__cta {
          display: inline-flex !important;
          align-items: center !important;
          padding: 15px 34px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          border-radius: 30px !important;
          letter-spacing: 0.04em !important;
          background: var(--text-light) !important;
          color: var(--bg-dark) !important;
          border: 1px solid var(--text-light) !important;
          transition: transform 0.2s ease, background 0.2s ease !important;
        }
        .home-hero__cta:hover {
          transform: translateY(-2px) scale(1.03) !important;
          background: #ffffff !important;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2) !important;
        }

        .home-hero__link {
          text-decoration: none;
          color: var(--text-light);
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .home-hero__link:hover {
          color: var(--accent-orange);
          transform: translateX(3px);
        }

        .home-hero__scroll-hint {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 40px;
          opacity: 0.4;
        }
        .home-hero__scroll-line {
          display: inline-block;
          width: 30px;
          height: 1.5px;
          background: var(--text-muted);
        }
        .home-hero__scroll-hint span:last-child {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Live badge ── */
        .hero-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          padding: 5px 13px 5px 9px;
          border-radius: 20px;
          border: 1px solid var(--border-dark);
          margin-bottom: 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .hero-live-badge__dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--accent-orange);
          animation: liveDot 2s ease-in-out infinite;
          box-shadow: 0 0 0 3px rgba(255,85,0,0.18);
        }
        .hero-live-badge span:last-child {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
          color: var(--accent-orange);
          text-transform: uppercase;
        }
        @keyframes liveDot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,85,0,0.2); }
          50%       { box-shadow: 0 0 0 6px rgba(255,85,0,0.05); }
        }

        /* ── Background orbs ── */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .hero-orb--r {
          width: 700px; height: 700px;
          right: -120px; top: 50%;
          transform: translateY(-50%);
          background: radial-gradient(circle, rgba(255,85,0,0.05) 0%, transparent 65%);
          filter: blur(70px);
          animation: orbFloat 12s ease-in-out infinite alternate;
        }
        .hero-orb--l {
          width: 400px; height: 400px;
          left: 5%; bottom: -15%;
          background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%);
          filter: blur(90px);
          animation: orbFloat 18s ease-in-out infinite alternate-reverse;
        }
        @keyframes orbFloat {
          from { transform: translateY(-50%) scale(1); }
          to   { transform: translateY(-52%) scale(1.07); }
        }

        /* ════════════════════════════════
           RESPONSIVE
           ════════════════════════════════ */
        @media (max-width: 900px) {
          .home-hero::after {
            background: linear-gradient(
              to top,
              rgba(0,0,0,0.85) 20%,
              rgba(0,0,0,0.4) 60%,
              transparent 100%
            );
          }
          .home-hero__text {
            position: absolute;
            top: auto;
            bottom: 5vh;
            left: 24px;
            right: 24px;
            transform: none;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .home-hero__sub {
            margin-left: auto;
            margin-right: auto;
          }
          .home-hero__actions {
            justify-content: center;
          }
          .home-hero__scroll-hint {
            justify-content: center;
          }
          .home-hero__h1 {
            font-size: clamp(2.2rem, 8vw, 3.8rem);
          }
        }
      `}</style>
    </div>
  );
}
