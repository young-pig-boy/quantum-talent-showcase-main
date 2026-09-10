'use client';

import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { EText } from '@/lib/language-mode';
import { useLanguageMode } from '@/lib/language-mode';
import { UrgentJobsSection } from '@/components/sections/urgent-jobs-section';
import { FeaturedJobsSection } from '@/components/sections/featured-jobs-section';
import { TracksSection } from '@/components/sections/tracks-section';
import { JobCenterSection } from '@/components/sections/job-center-section';

export function JobFastLaneSection() {
  const { mode } = useLanguageMode();

  return (
    <section id="job-fast-lane" className="relative bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        {/* Unified header */}
        <ScrollReveal className="mb-16 pt-20 sm:pt-28">
          {mode !== 'en' && (
            <p className="mb-4 font-mono text-sm font-medium tracking-[0.2em] text-accent uppercase">
              Job Fast Lane
            </p>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            <EText zh="岗位快车道" en="Job Fast Lane" display />
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            <EText
              zh="快速进入当前最值得关注的量子科技岗位机会"
              en="The fastest route to the most relevant quantum technology opportunities"
            />
          </p>
        </ScrollReveal>

        {/* 01 — Job Center */}
        <div className="mb-20">
          <JobCenterSection />
        </div>

        {/* 02 — Urgent Jobs */}
        <div className="mb-20">
          <UrgentJobsSection />
        </div>

        {/* 03 — Featured Jobs */}
        <div className="mb-20">
          <FeaturedJobsSection />
        </div>

        {/* 04 — Frontier Tracks */}
        <div>
          <TracksSection />
        </div>
      </div>
    </section>
  );
}
