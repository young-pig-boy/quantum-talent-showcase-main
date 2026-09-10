'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { useLanguageMode } from '@/lib/language-mode';

interface SubSection {
  id: string;
  label: string;
  labelEn: string;
}

const subSections: SubSection[] = [
  { id: 'job-center', label: '岗位中心', labelEn: 'Job Center' },
  { id: 'urgent-jobs', label: '急招岗位', labelEn: 'Urgent Hiring' },
  { id: 'featured-jobs', label: '精选岗位', labelEn: 'Featured Positions' },
  { id: 'quantum-tracks', label: '前沿赛道', labelEn: 'Frontier Tracks' },
];

interface JobFastLaneSubNavProps {
  /** Currently active sub-section ID, determined by scroll spy in parent. */
  activeId: string | null;
}

/**
 * Secondary navigation for the Job Fast Lane area.
 *
 * This is a **pure presentational** component — it does NOT own any scroll
 * spy logic. The parent (Navbar) determines `activeId` via a unified
 * scroll spy and passes it in as a prop.
 *
 * Visibility (show/hide) is also controlled by the parent wrapper.
 */
export function JobFastLaneSubNav({ activeId }: JobFastLaneSubNavProps) {
  const { mode } = useLanguageMode();
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Update desktop indicator position
  const updateIndicator = useCallback(() => {
    if (!activeId) {
      setIndicatorStyle(null);
      return;
    }
    const anchor = itemRefs.current[activeId];
    const container = desktopContainerRef.current;
    if (!anchor || !container || anchor.offsetParent === null) {
      setIndicatorStyle(null);
      return;
    }
    const anchorRect = anchor.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setIndicatorStyle({
      left: anchorRect.left - containerRect.left,
      width: anchorRect.width,
    });
  }, [activeId]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (!activeId || !mobileScrollRef.current) return;
    const activeEl = itemRefs.current[`mobile_${activeId}`];
    if (activeEl && mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const elLeft = activeEl.offsetLeft;
      const elWidth = activeEl.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = elLeft - containerWidth / 2 + elWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeId]);

  const handleClick = useCallback((id: string) => {
    trackEvent('job_view', { target: `subnav_${id}` });
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
    // No setActive — active state is determined by scroll position only
  }, []);

  return (
    <>
      {/* Desktop — centered pill with moving indicator */}
      <div
        ref={desktopContainerRef}
        className="relative hidden items-center rounded-full border border-border bg-surface-glass px-1.5 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl md:flex"
      >
        {/* Moving capsule indicator */}
        {indicatorStyle && (
          <div
            className="pointer-events-none absolute rounded-full border border-border bg-surface-glass-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              top: 4,
              bottom: 4,
            }}
            aria-hidden="true"
          />
        )}

        {subSections.map((section) => (
          <button
            key={section.id}
            type="button"
            ref={(el) => {
              itemRefs.current[section.id] = el;
            }}
            onClick={() => handleClick(section.id)}
            className={cn(
              'relative z-10 rounded-full px-4 py-1.5 text-[12px] font-light tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
              activeId === section.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mode === 'en' ? section.labelEn : section.label}
          </button>
        ))}
      </div>

      {/* Mobile — horizontal scrollable tabs */}
      <div
        ref={mobileScrollRef}
        className="scrollbar-hide flex items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-surface-glass px-1 py-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden"
      >
        {subSections.map((section) => (
          <button
            key={section.id}
            type="button"
            ref={(el) => {
              itemRefs.current[`mobile_${section.id}`] = el;
            }}
            onClick={() => handleClick(section.id)}
            className={cn(
              'relative z-10 shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-light tracking-wide transition-colors duration-200 focus:outline-none',
              activeId === section.id
                ? 'bg-surface-glass-hover text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mode === 'en' ? section.labelEn : section.label}
          </button>
        ))}
      </div>
    </>
  );
}
