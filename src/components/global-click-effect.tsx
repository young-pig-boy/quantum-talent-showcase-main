'use client';

import { useEffect, useRef } from 'react';
import { useThemeContext } from '@/components/theme-provider';

// ─── Identical palette constants as Hero ProbabilityBurst ───
const BURST_LIGHT = ['#3157FF', '#FF5A36', '#FFB03A', '#7AA7FF'];
const BURST_DARK = ['#8DBBFF', '#C7A6FF', '#67E8F9', '#F0ABFC'];

// ─── Identical physics & lifecycle params as ProbabilityBurst ───
const MAX_BURSTS = 4;
const MIN_INTERVAL_MS = 140;
const DPR_CAP = 1.5;

// ─── Identical types ───
interface Grain {
  angle: number;
  size: number;
  color: string;
  jitter: number;
}

interface Orbit {
  rx: number;
  ry: number;
  rotation: number;
  direction: 1 | -1;
  speed: number;
  grains: Grain[];
}

interface Burst {
  x: number;
  y: number;
  born: number;
  life: number;
  orbits: Orbit[];
}

// ─── Identical helpers ───
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/**
 * GlobalClickEffect — reuses the EXACT same elliptical particle probability
 * cloud rendering as Hero's ProbabilityBurst, but scoped to the full viewport
 * via position:fixed.  Canvas is pointer-events:none so it never blocks
 * underlying interactions.
 *
 * Architectural notes:
 * - Skips clicks inside #hero (hero-section handles its own ProbabilityBurst).
 * - Skips input/textarea/select to avoid interfering with form interaction.
 * - Mobile tap gets the same visual; grain count is halved on touch devices.
 * - RAF only runs while bursts are alive; idles at zero cost.
 * - Disabled entirely under prefers-reduced-motion.
 */
export function GlobalClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cssW = 1;
    let cssH = 1;
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const resize = () => {
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const bursts: Burst[] = [];
    let raf = 0;
    let lastTap = 0;

    // ---- spawnBurst: IDENTICAL to ProbabilityBurst, except mobile grain reduction ----
    const spawnBurst = (x: number, y: number) => {
      const colors =
        theme === 'dark'
          ? BURST_DARK.length > 0
            ? BURST_DARK
            : ['#3b6ef6', '#ec4899']
          : BURST_LIGHT.length > 0
            ? BURST_LIGHT
            : ['#3157ff', '#ff5a36'];

      const orbitCount = 2 + (Math.random() < 0.5 ? 1 : 0);
      const orbits: Orbit[] = [];
      for (let o = 0; o < orbitCount; o++) {
        const rx = 64 + Math.random() * 96;
        const ry = rx * (0.34 + Math.random() * 0.28);
        const baseGrainCount = 14 + Math.floor(Math.random() * 8);
        // Mobile: reduce grain count to 50-70% without altering visual style
        const grainCount = isTouchDevice
          ? Math.max(8, Math.floor(baseGrainCount * (0.5 + Math.random() * 0.2)))
          : baseGrainCount;
        const grains: Grain[] = [];
        for (let g = 0; g < grainCount; g++) {
          grains.push({
            angle: Math.random() * Math.PI * 2,
            size: 0.9 + Math.random() * 1.5,
            color: pick(colors),
            jitter: 0.6 + Math.random() * 0.4,
          });
        }
        orbits.push({
          rx,
          ry,
          rotation: Math.random() * Math.PI,
          direction: Math.random() < 0.5 ? 1 : -1,
          speed: 1.4 + Math.random() * 1.2,
          grains,
        });
      }
      bursts.push({
        x,
        y,
        born: performance.now(),
        life: 850 + Math.random() * 550,
        orbits,
      });
      if (bursts.length > MAX_BURSTS) bursts.splice(0, bursts.length - MAX_BURSTS);
      if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };

    // ---- pointerdown handler: global viewport coords ----
    const onPointerDown = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastTap < MIN_INTERVAL_MS) return;

      // Skip Hero area — hero-section has its own ProbabilityBurst
      const target = e.target as HTMLElement | null;
      if (target?.closest('#hero')) return;

      // Skip form controls to avoid interfering with typing / selection
      const tag = (target?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      lastTap = now;
      // Use clientX / clientY — viewport-relative, canvas covers full viewport
      spawnBurst(e.clientX, e.clientY);
    };

    // ---- frame: IDENTICAL rendering loop as ProbabilityBurst ----
    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) {
        bursts.length = 0;
        ctx.clearRect(0, 0, cssW, cssH);
        return;
      }
      ctx.clearRect(0, 0, cssW, cssH);

      for (let b = bursts.length - 1; b >= 0; b--) {
        const burst = bursts[b];
        const age = now - burst.born;
        const p = age / burst.life;
        if (p >= 1) {
          bursts.splice(b, 1);
          continue;
        }
        const scale = 0.22 + easeOutCubic(p) * 0.98;
        const alpha = Math.pow(1 - p, 1.35) * 0.85;
        const ageSec = age / 1000;

        for (const orbit of burst.orbits) {
          const cosR = Math.cos(orbit.rotation);
          const sinR = Math.sin(orbit.rotation);
          const rxs = orbit.rx * scale;
          const rys = orbit.ry * scale;
          for (const grain of orbit.grains) {
            const a = grain.angle + orbit.direction * orbit.speed * ageSec;
            const ex = Math.cos(a) * rxs;
            const ey = Math.sin(a) * rys;
            const gx = burst.x + ex * cosR - ey * sinR;
            const gy = burst.y + ex * sinR + ey * cosR;
            ctx.globalAlpha = alpha * grain.jitter;
            ctx.fillStyle = grain.color;
            ctx.beginPath();
            ctx.arc(gx, gy, grain.size * (0.75 + 0.5 * (1 - p)), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Brief core flash at the click point (identical)
        if (p < 0.22) {
          const coreAlpha = (1 - p / 0.22) * 0.5;
          ctx.globalAlpha = coreAlpha;
          ctx.fillStyle = burst.orbits[0]?.grains[0]?.color ?? '#3157ff';
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, 3 + p * 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (bursts.length > 0) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, cssW, cssH);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
      }}
      aria-hidden="true"
    />
  );
}
