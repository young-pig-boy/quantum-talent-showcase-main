'use client';

import { useEffect, useRef } from 'react';

interface ProbabilityBurstProps {
  /** Theme-aware grain colors, ordered primary → accent. */
  palette: string[];
  className?: string;
}

interface Grain {
  /** Base angle on the ellipse (rad). */
  angle: number;
  size: number;
  color: string;
  /** Per-grain alpha jitter. */
  jitter: number;
}

interface Orbit {
  rx: number;
  ry: number;
  rotation: number;
  direction: 1 | -1;
  /** Angular velocity (rad / s). */
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

const MAX_BURSTS = 4;
const MIN_INTERVAL_MS = 140;
const DPR_CAP = 1.5;

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

/**
 * ProbabilityBurst — click / tap feedback for the Hero.
 *
 * On pointerdown inside the Hero, 2~3 irregular elliptical particle traces
 * expand outward from the click point, then dissolve within ~0.8–1.5s —
 * an "electron cloud / orbital probability" gesture rather than fireworks
 * or a circular ripple. Canvas 2D, DPR-capped, and the rAF loop only runs
 * while at least one burst is alive. Works for mouse and touch taps; no
 * continuous per-frame cost while idle.
 *
 * Disabled entirely under prefers-reduced-motion.
 */
export function ProbabilityBurst({ palette, className = '' }: ProbabilityBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(palette);

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cssW = 1;
    let cssH = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const bursts: Burst[] = [];
    let raf = 0;
    let lastTap = 0;

    const spawnBurst = (x: number, y: number) => {
      const colors = paletteRef.current.length > 0 ? paletteRef.current : ['#3157ff', '#ff5a36'];
      const orbitCount = 2 + (Math.random() < 0.5 ? 1 : 0);
      const orbits: Orbit[] = [];
      for (let o = 0; o < orbitCount; o++) {
        const rx = 64 + Math.random() * 96;
        const ry = rx * (0.34 + Math.random() * 0.28);
        const grainCount = 14 + Math.floor(Math.random() * 8);
        const grains: Grain[] = [];
        for (let g = 0; g < grainCount; g++) {
          grains.push({
            angle: Math.random() * Math.PI * 2,
            size: 0.9 + Math.random() * 1.5,
            color: pick(colors),
            jitter: 0.6 + Math.random() * 0.4
          });
        }
        orbits.push({
          rx,
          ry,
          rotation: Math.random() * Math.PI,
          direction: Math.random() < 0.5 ? 1 : -1,
          speed: 1.4 + Math.random() * 1.2,
          grains
        });
      }
      bursts.push({
        x,
        y,
        born: performance.now(),
        life: 850 + Math.random() * 550,
        orbits
      });
      if (bursts.length > MAX_BURSTS) bursts.splice(0, bursts.length - MAX_BURSTS);
      if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastTap < MIN_INTERVAL_MS) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      lastTap = now;
      spawnBurst(x, y);
    };

    const frame = (now: number) => {
      raf = 0;
      if (document.hidden) {
        // Tab hidden — drop in-flight bursts and stop the loop.
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

        // Brief core flash at the click point.
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

    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
