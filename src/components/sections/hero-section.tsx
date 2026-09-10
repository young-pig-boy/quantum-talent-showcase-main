'use client';

/**
 * HeroSection — "Quantum Superposition" hero.
 *
 * Structure (desktop):
 *   section (min-h 85vh, theme-aware field)
 *   └─ QuantumSuperposition   — abstract layered volumes, right ~60%
 *   └─ readability veils      — theme-aware gradients
 *   └─ ProbabilityBurst       — click/tap elliptical particle cloud
 *   └─ copy block             — eyebrow / title / subtitle, left ~40%
 *
 * Behavior contract:
 * - Pointer micro-response shifts the visual layers by at most ±8px.
 * - Touch devices get tap-triggered ProbabilityBurst only (no follow).
 * - prefers-reduced-motion: static poster, no burst, no breathing.
 * - Breathing animations pause when the hero leaves the viewport.
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '@/lib/data';
import { useThemeContext } from '@/components/theme-provider';
import { useLanguageMode } from '@/lib/language-mode';
import { cn } from '@/lib/utils';
import { QuantumSuperposition } from './hero/quantum-superposition';
import { ProbabilityBurst } from './hero/probability-burst';

const BURST_LIGHT = ['#3157FF', '#FF5A36', '#FFB03A', '#7AA7FF'];
const BURST_DARK = ['#8DBBFF', '#C7A6FF', '#67E8F9', '#F0ABFC'];

export function HeroSection() {
  const { theme } = useThemeContext();
  const { mode } = useLanguageMode();
  const sectionRef = useRef<HTMLElement>(null);
  const [finePointer, setFinePointer] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* Resolve pointer & motion preferences after mount (SSR-safe). */
  useEffect(() => {
    setFinePointer(window.matchMedia('(pointer: fine)').matches);
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /*
   * Pointer micro-response: feed normalized pointer position into the
   * --qv-mx / --qv-my custom properties. The visual layers consume them
   * with per-layer depth factors, capped at ±8px — no parallax.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !finePointer || reducedMotion) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = section.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        section.style.setProperty('--qv-mx', mx.toFixed(3));
        section.style.setProperty('--qv-my', my.toFixed(3));
      });
    };
    const onLeave = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      section.style.setProperty('--qv-mx', '0');
      section.style.setProperty('--qv-my', '0');
    };

    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [finePointer, reducedMotion]);

  /* Pause CSS breathing while the hero is off-screen. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => {
      section.classList.toggle('hero-offscreen', !entry.isIntersecting);
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const palette = theme === 'dark' ? BURST_DARK : BURST_LIGHT;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[85vh] w-full overflow-hidden bg-hero-bg transition-colors duration-300"
    >
      {/* Quantum superposition visual — right ~60% desktop, lower field mobile */}
      <QuantumSuperposition />

      {/* Theme-aware readability veils */}
      <div
        className="absolute inset-0 z-[1] hidden md:block"
        style={{ background: 'var(--hero-veil-left)' }}
      />
      <div
        className="absolute inset-0 z-[1] md:hidden"
        style={{ background: 'var(--hero-veil-mobile)' }}
      />
      <div
        className="absolute inset-x-0 top-0 z-[1] h-28"
        style={{ background: 'var(--hero-veil-top)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-36"
        style={{
          background:
            'linear-gradient(to top, var(--background) 0%, transparent 100%)'
        }}
      />

      {/* Click / tap probability cloud — works for mouse and touch */}
      {!reducedMotion && (
        <ProbabilityBurst palette={palette} className="absolute inset-0 z-[6] h-full w-full" />
      )}

      {/* Copy block — left ~40% on desktop */}
      <div className="relative z-10 mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col px-6 lg:px-10">
        <div className="h-16 sm:h-20" />
        <div className="flex flex-1 items-center">
          <div className="max-w-xl">
            <p className="mb-5 font-mono text-[10px] font-medium tracking-[0.42em] text-hero-ink-faint uppercase sm:text-[11px]">
              {siteConfig.heroEnglishTagline}
            </p>
            <h1
              className={cn(
                'text-[2.35rem] leading-[1.12] font-semibold tracking-tight text-hero-ink sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem]',
                mode === 'zh' && 'sm:whitespace-nowrap',
                mode === 'en' && 'font-serif',
              )}
            >
              {mode === 'en' ? siteConfig.heroTitleEn : siteConfig.heroTitle}
            </h1>
            <p className="mt-6 text-sm leading-[1.9] text-hero-ink-soft sm:text-[15px] lg:max-w-lg lg:text-base">
              {mode === 'en' ? siteConfig.heroSubtitleEn : siteConfig.heroSubtitle}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center pt-10 pb-8 sm:pb-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-[0.3em] text-hero-ink-faint uppercase">
              Scroll
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-hero-ink-soft" />
          </div>
        </div>
      </div>
    </section>
  );
}
