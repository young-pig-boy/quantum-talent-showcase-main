'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguageMode } from '@/lib/language-mode';

interface Section {
  id: string;
  labelZh: string;
  labelEn: string;
}

const sections: Section[] = [
  { id: 'hero', labelZh: '首页', labelEn: 'Home' },
  { id: 'why', labelZh: '为什么是量子科技', labelEn: 'Why Quantum Tech' },
  { id: 'tracks', labelZh: '前沿赛道', labelEn: 'Frontier Tracks' },
  { id: 'jobs', labelZh: '精选岗位', labelEn: 'Featured Positions' },
  { id: 'join', labelZh: '联系我们', labelEn: 'Contact Us' },
];

export function ScrollDots() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { mode } = useLanguageMode();

  const scrollTo = useCallback((sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const sectionEls = sections.map((s) =>
      s.id === 'hero' ? null : document.getElementById(s.id),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first section that is mostly visible
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = sections.findIndex((s) => s.id === entry.target.id);
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        }

        // If we're at the very top of the page, highlight Hero
        if (window.scrollY < window.innerHeight * 0.3) {
          setActiveIndex(0);
        }
      },
      {
        threshold: 0.35,
        rootMargin: '-10% 0px -10% 0px',
      },
    );

    // Observe all content sections
    sectionEls.forEach((el) => {
      if (el) observer.observe(el);
    });

    // Also track scroll position for hero detection
    const handleScroll = () => {
      if (window.scrollY < window.innerHeight * 0.3) {
        setActiveIndex(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          aria-label={mode === 'en' ? section.labelEn : section.labelZh}
          title={mode === 'en' ? section.labelEn : section.labelZh}
          className={cn(
            'rounded-full transition-all duration-300',
            index === activeIndex
              ? 'h-1.5 w-1.5 bg-white/60'
              : 'h-1.5 w-1.5 border border-white/[0.15] hover:border-white/40 hover:bg-white/20',
          )}
        />
      ))}
    </div>
  );
}
