'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getTrackById } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import { usePublicJobs, isUrgentActive, type PublicJob } from '@/hooks/use-public-jobs';
import { useLanguageMode } from '@/lib/language-mode';
import { localizedPublicJob } from '@/lib/public-job';
import { localizeCity, localizeDisplayValue } from '@/lib/localized-helpers';
import { JobCode } from '@/components/job/job-code';

export function FeaturedJobsSection() {
  const { jobs, loading, error, retry } = usePublicJobs({ featured: true, limit: 6 });
  const { mode } = useLanguageMode();

  return (
    <div id="featured-jobs">
      {/* Section header */}
      <ScrollReveal className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-sm font-medium tracking-[0.15em] text-accent/60 uppercase">
            03
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {mode !== 'en' && (
          <p className="mb-3 font-mono text-sm font-medium tracking-[0.2em] text-accent uppercase">
            Featured Positions
          </p>
        )}
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          {mode === 'en' ? 'Featured Positions' : '精选岗位'}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {mode === 'en'
            ? 'Opportunities flagged by our headhunting team'
            : '猎头团队重点关注的岗位机会'}
        </p>
      </ScrollReveal>

      {/* Loading state */}
      {loading && (
        <div className="border-t border-white/[0.06] py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'en' ? 'Loading...' : '加载中...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <ScrollReveal>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="mb-2 text-sm font-medium text-foreground">
              {mode === 'en' ? 'Failed to load featured positions' : '精选岗位加载失败'}
            </p>
            <p className="mb-4 text-xs text-muted-foreground">{error}</p>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full bg-surface-glass-hover px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface-glass-hover"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {mode === 'en' ? 'Retry' : '重新加载'}
            </button>
          </div>
        </ScrollReveal>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-card/50 p-10 text-center">
            <p className="mb-2 text-sm font-medium text-foreground">
              {mode === 'en' ? 'No featured positions right now' : '暂无精选岗位'}
            </p>
            <p className="mb-5 text-xs text-muted-foreground">
              {mode === 'en' ? 'Browse all open opportunities' : '可以查看全部开放机会'}
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 rounded-full bg-surface-glass px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-glass-hover focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {mode === 'en' ? 'View All Jobs' : '查看全部岗位'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      )}

      {/* Magazine-style listing */}
      {!loading && !error && jobs.length > 0 && (
        <div className="border-t border-white/[0.06]">
          {jobs.map((job, index) => (
            <FeaturedJobRow key={job.id} job={job} index={index} />
          ))}
        </div>
      )}

      {/* View all featured CTA */}
      {!loading && !error && jobs.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            href="/opportunities?featured=true"
            className="inline-flex items-center gap-2 rounded-full bg-surface-glass px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-surface-glass-hover focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {mode === 'en' ? 'View All Featured Positions' : '查看全部精选岗位'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function FeaturedJobRow({ job, index }: { job: PublicJob; index: number }) {
  const track = job.track ? getTrackById(job.track) : null;
  const { mode } = useLanguageMode();
  const loc = localizedPublicJob(job, mode);
  const directionDisplay = loc.direction || track?.name || '';
  const showUrgent = isUrgentActive(job);

  return (
    <ScrollReveal key={job.id} delay={index * 0.05}>
      <Link
        href={`/jobs/${job.slug}`}
        onClick={() => trackEvent('job_view', { job_id: job.id, source: 'featured' })}
        className="group grid gap-3 border-b border-white/[0.06] py-5 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-6 md:py-6"
      >
        {/* Index number */}
        <div className="md:col-span-1">
          <span className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Job title + badges */}
        <div className="md:col-span-5">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {track && (
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {track.englishName}
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
                {mode === 'en' ? 'Featured' : '精选'}
              </span>
            </span>
            {showUrgent && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                <Zap className="h-2.5 w-2.5 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                  {mode === 'en' ? 'Urgent' : '急招'}
                </span>
              </span>
            )}
          </div>
          <h4 className="text-base font-medium text-foreground transition-colors group-hover:text-accent-light sm:text-lg">
            {loc.title}
          </h4>
          {(directionDisplay || job.public_job_code) && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              {directionDisplay && (
                <p className="text-xs text-muted-foreground">{directionDisplay}</p>
              )}
              {job.public_job_code && <JobCode code={job.public_job_code} />}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <p className="text-sm text-muted-foreground">
            <span className="text-xs text-muted-foreground/60">
              {mode === 'en' ? 'Location: ' : '地点：'}
            </span>
            {localizeCity(job.city, mode)}
          </p>
        </div>

        {/* Experience */}
        <div className="md:col-span-2">
          {job.experience && (
            <p className="text-sm text-muted-foreground">
              <span className="text-xs text-muted-foreground/60">
                {mode === 'en' ? 'Experience: ' : '经验：'}
              </span>
              {localizeDisplayValue(job.experience, mode)}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-end md:col-span-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
        </div>
      </Link>
    </ScrollReveal>
  );
}
