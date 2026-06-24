import React, { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 100;

/** Zero-padded frame URL — served directly by Vite from client/public/banner/ */
const frameUrl = (i) => `/banner/frame_${String(i).padStart(3, '0')}.png`;

export default function RotatingBanner() {
  const canvasRef      = useRef(null);
  const containerRef   = useRef(null);
  const imagesRef      = useRef([]);
  const animRef        = useRef(null);
  const roRef          = useRef(null);          // ResizeObserver

  const currentFrameRef     = useRef(0);
  const targetFrameRef      = useRef(0);
  const lastScrollTimeRef   = useRef(0);

  const [loadedCount, setLoadedCount]     = useState(0);   // 0-100
  const [imagesReady, setImagesReady]     = useState(false);
  const [canvasReady, setCanvasReady]     = useState(false);
  const [hasError, setHasError]           = useState(false);

  const loadPct = Math.floor((loadedCount / TOTAL_FRAMES) * 100);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PRELOAD  — images go into client/public/banner/ (Vite static asset)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const pool = new Array(TOTAL_FRAMES).fill(null);
    let finished = 0;
    let errorCount = 0;

    console.log('[RotatingBanner] Preloading', TOTAL_FRAMES, 'frames from /banner/');

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(i + 1);

      img.onload = () => {
        pool[i] = img;
        finished++;
        setLoadedCount(finished);
        if (finished === TOTAL_FRAMES) {
          imagesRef.current = pool;
          setImagesReady(true);
          console.log('[RotatingBanner] ✅ All frames loaded');
        }
      };

      img.onerror = () => {
        finished++;
        errorCount++;
        console.warn('[RotatingBanner] ⚠️ Failed to load', frameUrl(i + 1));
        setLoadedCount(finished);
        if (finished === TOTAL_FRAMES) {
          imagesRef.current = pool;
          if (errorCount === TOTAL_FRAMES) {
            setHasError(true);
            console.error('[RotatingBanner] ❌ ALL frames failed to load — check /banner/ path');
          } else {
            setImagesReady(true);
            console.log('[RotatingBanner] ⚠️ Loaded with', TOTAL_FRAMES - errorCount, '/ 100 frames');
          }
        }
      };
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. DRAW a single frame at index (float → rounded)
  // ─────────────────────────────────────────────────────────────────────────
  const drawFrame = useCallback((frameFloat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const idx = Math.floor(frameFloat) % TOTAL_FRAMES;
    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * 0.88;
    const x = (canvas.width  - img.naturalWidth  * scale) / 2;
    const y = (canvas.height - img.naturalHeight * scale) / 2;
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RESIZE CANVAS — use ResizeObserver so we get the real pixel dimensions
  // ─────────────────────────────────────────────────────────────────────────
  const syncCanvasSize = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width        = w * dpr;
    canvas.height       = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';

    console.log('[RotatingBanner] Canvas sized:', w, 'x', h, '(dpr', dpr + ')');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    roRef.current = new ResizeObserver(() => syncCanvasSize());
    roRef.current.observe(containerRef.current);
    syncCanvasSize();
    return () => roRef.current?.disconnect();
  }, [syncCanvasSize]);

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ANIMATION LOOP — runs once images are ready
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imagesReady) return;

    // Scroll → frame mapping
    // The hero section is 100vh. As it scrolls OUT of the viewport (rect.top goes negative),
    // we map that exit distance to frames 0→99. Idle → slow auto-rotation.
    const handleScroll = () => {
      lastScrollTimeRef.current = Date.now();

      const section = containerRef.current?.closest('section');
      if (!section) return;

      const rect    = section.getBoundingClientRect();
      // How many px have scrolled above the viewport top (0 when top is in view)
      const scrolledOut = Math.max(0, -rect.top);
      const range       = Math.max(1, section.offsetHeight);
      const fraction    = Math.min(scrolledOut / range, 1);

      targetFrameRef.current = fraction * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      const idleMs = Date.now() - lastScrollTimeRef.current;

      if (idleMs > 1500) {
        // Gentle idle auto-rotation
        targetFrameRef.current = (targetFrameRef.current + 0.15) % TOTAL_FRAMES;
      }

      // Wrap-aware LERP
      const ease = 0.10;
      let diff = targetFrameRef.current - currentFrameRef.current;
      if (diff >  TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
      if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;
      currentFrameRef.current = (currentFrameRef.current + diff * ease + TOTAL_FRAMES) % TOTAL_FRAMES;

      drawFrame(currentFrameRef.current);
      setCanvasReady(true);            // signal that at least 1 frame has been drawn
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [imagesReady, drawFrame]);

  // ─────────────────────────────────────────────────────────────────────────
  // 5. JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // ✅ ALWAYS VISIBLE — no opacity tricks
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,85,0,0.07) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        animation: 'shoeGlowPulse 4s ease-in-out infinite alternate',
      }} />

      {/* ── ERROR STATE ── */}
      {hasError && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👟</div>
          <p style={{ fontSize: '14px', fontWeight: '600' }}>360° viewer unavailable</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>Check that /banner/ frames are accessible</p>
        </div>
      )}

      {/* ── LOADING STATE — show fallback frame_001 immediately ── */}
      {!hasError && !canvasReady && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '16px', zIndex: 3,
        }}>
          {/* Show first frame as static fallback immediately */}
          <img
            src="/banner/frame_001.png"
            alt="Nike Sneaker Preview"
            style={{
              maxWidth: '80%',
              maxHeight: '60%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '140px', height: '2px',
              background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${loadPct}%`, height: '100%',
                background: 'var(--accent-orange)',
                transition: 'width 0.08s linear',
              }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-orange)', letterSpacing: '0.14em' }}>
              LOADING 360° · {loadPct}%
            </span>
          </div>
        </div>
      )}

      {/* ── CANVAS (always in DOM, becomes visible once drawn) ── */}
      {!hasError && (
        <>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              position: 'relative',
              zIndex: 2,
              opacity: canvasReady ? 1 : 0,
              transition: 'opacity 0.4s ease',
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.16)) drop-shadow(0 0 50px rgba(255,85,0,0.05))',
              cursor: 'grab',
            }}
          />

          {/* Scroll hint */}
          {canvasReady && (
            <div style={{
              position: 'absolute', bottom: '28px', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              color: 'var(--text-muted)', opacity: 0.5, pointerEvents: 'none', zIndex: 5,
            }}>
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                <rect x="1" y="1" width="12" height="20" rx="6" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="5.5" y="4" width="3" height="5" rx="1.5" fill="currentColor">
                  <animate attributeName="y" values="4;11;4" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/>
                </rect>
              </svg>
              <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Scroll to rotate
              </span>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes shoeGlowPulse {
          from { opacity: 0.7; transform: scale(0.95); }
          to   { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
