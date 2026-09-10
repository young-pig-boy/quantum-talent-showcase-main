'use client';

import { useEffect, useRef, useState } from 'react';
import { getPartners } from '@/lib/data';
import { useLanguageMode } from '@/lib/language-mode';
import type { Partner } from '@/lib/types';

const PARTNERS_DATA = getPartners();

function PartnerItem({ partner, isDuplicated }: { partner: Partner; isDuplicated?: boolean }) {
  const id = isDuplicated ? `${partner.id}-dup` : partner.id;

  if (partner.logo) {
    return (
      <div
        key={id}
        className="flex shrink-0 items-center justify-center px-6"
      >
        <img
          src={partner.logo}
          alt={partner.name}
          className="h-8 w-auto object-contain opacity-40 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0"
        />
      </div>
    );
  }

  return (
    <div
      key={id}
      className="flex shrink-0 items-center px-6"
    >
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap transition-colors duration-300 hover:text-muted-foreground">
        {partner.name}
      </span>
    </div>
  );
}

export function PartnersSection() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { mode } = useLanguageMode();

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia('(max-width: 768px)');

    setReducedMotion(mqMotion.matches);
    setIsMobile(mqMobile.matches);

    const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqMotion.addEventListener('change', handleMotion);
    mqMobile.addEventListener('change', handleMobile);
    return () => {
      mqMotion.removeEventListener('change', handleMotion);
      mqMobile.removeEventListener('change', handleMobile);
    };
  }, []);

  // For seamless infinite loop, render the list twice
  const displayItems = [...PARTNERS_DATA, ...PARTNERS_DATA];

  // Marquee speed: slower on mobile
  const speed = isMobile ? '50s' : '30s';

  return (
    <section id="partners" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
            Partners &amp; Institutions
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {mode === 'en' ? 'Partners' : '合作机构'}
          </h2>
        </div>

        {reducedMotion ? (
          /* Static grid for reduced motion */
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {PARTNERS_DATA.map((partner) => (
              <div key={partner.id} className="flex items-center justify-center px-6">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-8 w-auto object-contain opacity-50 grayscale"
                  />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Marquee */
          <div
            className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div
              ref={marqueeRef}
              className="flex w-max py-4"
              style={{
                animationName: 'marquee',
                animationDuration: speed,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {displayItems.map((partner, idx) => (
                <PartnerItem
                  key={`${partner.id}-${idx}`}
                  partner={partner}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
