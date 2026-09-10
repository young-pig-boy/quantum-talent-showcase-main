'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollSpyOptions {
  /**
   * Fixed trigger line offset from viewport top (px).
   * A section becomes "active" when its top edge crosses above this line.
   * Default: 140px (accounts for fixed navbar height + padding).
   */
  offset?: number;
}

/**
 * Scroll-spy hook using a fixed trigger-line approach.
 *
 * Iterates section IDs in document order; the **last** section whose
 * `getBoundingClientRect().top` is ≤ `offset` becomes active.
 *
 * This avoids the jitter common with IntersectionObserver max-ratio
 * approaches and ensures the active state always reflects the user's
 * actual scroll position — never a stale click.
 */
export function useScrollSpy(
  sectionIds: string[],
  options: UseScrollSpyOptions = {},
): string | null {
  const offset = options.offset ?? 140;
  const [activeId, setActiveId] = useState<string | null>(null);
  const tickingRef = useRef(false);

  const compute = useCallback(() => {
    if (sectionIds.length === 0) return;

    let current: string | null = null;

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= offset) {
        current = id;
      }
    }

    setActiveId(current);
  }, [sectionIds, offset]);

  useEffect(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          compute();
          tickingRef.current = false;
        });
      }
    };

    // Initial computation
    compute();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionIds, compute]);

  return activeId;
}
