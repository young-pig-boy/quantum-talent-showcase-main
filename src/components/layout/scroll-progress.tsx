'use client';

import { useEffect, useRef, useState } from 'react';

/** Compute normalized scroll progress (0–1, clamped). */
function getProgress(): number {
  const scrollY = window.scrollY;
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 0;
  return Math.min(Math.max(scrollY / scrollableHeight, 0), 1);
}

/**
 * Ultra-thin scroll progress indicator pinned to the inside-bottom of the
 * liquid-glass Navbar capsule. Clipped by the nav's `rounded-full` + `overflow-hidden`.
 *
 * Fill colour is theme-aware via Tailwind dark: variant — no gradient, no glow.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const tickingRef = useRef(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    const tick = () => {
      tickingRef.current = false;
      setProgress(getProgress());
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(tick);
      }
    };

    tick();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] max-md:h-px"
      aria-hidden="true"
    >
      {/* Subtle background track */}
      <div className="absolute inset-0 bg-[rgb(20,20,30,0.05)] dark:bg-[rgb(255,255,255,0.05)]" />

      {/* Solid fill — lavender (light) / champagne gold (dark), scaleX avoids layout */}
      <div
        className="absolute inset-0 origin-left bg-[#A99BEF] dark:bg-[#C7A46A]"
        style={{
          transform: `scaleX(${progress})`,
          transition: reducedMotion ? 'none' : 'transform 120ms linear',
        }}
      />
    </div>
  );
}
