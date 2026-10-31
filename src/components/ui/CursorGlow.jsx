import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setPos = (el, x, y) => {
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    // Start centered so the follower is visible before the first mouse move.
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 3;
    let mx = cx;
    let my = cy;
    let ringX = cx;
    let ringY = cy;
    let glowX = cx;
    let glowY = cy;
    setPos(dotRef.current, cx, cy);
    setPos(ringRef.current, cx, cy);
    setPos(glowRef.current, cx, cy);

    // The dot tracks the pointer synchronously inside the event handler, so it
    // can never get stuck even if the animation frame loop is throttled.
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      setPos(dotRef.current, mx, my);
      if (reducedMotion) {
        ringX = mx;
        ringY = my;
        glowX = mx;
        glowY = my;
        setPos(ringRef.current, mx, my);
        setPos(glowRef.current, mx, my);
      }
    };

    // Ring + glow ease toward the pointer on a perpetual loop.
    let raf = 0;
    const tick = () => {
      ringX += (mx - ringX) * 0.2;
      ringY += (my - ringY) * 0.2;
      glowX += (mx - glowX) * 0.1;
      glowY += (my - glowY) * 0.1;
      setPos(ringRef.current, ringX, ringY);
      setPos(glowRef.current, glowX, glowY);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    if (!reducedMotion) raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] mix-blend-difference" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[180px] w-[180px] rounded-full bg-white/[0.06] blur-3xl will-change-transform"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 rounded-full border border-white/60 shadow-[0_0_16px_rgba(255,255,255,0.25)] will-change-transform"
      />
      <div ref={dotRef} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)] will-change-transform" />
    </div>
  );
}
