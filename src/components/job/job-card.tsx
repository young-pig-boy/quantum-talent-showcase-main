'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import type { PublicJob } from '@/hooks/use-public-jobs';
import { isUrgentActive } from '@/hooks/use-public-jobs';
import { getTrackById } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import { JobCode } from '@/components/job/job-code';
import { useLanguageMode } from '@/lib/language-mode';
import { localizeCity, localizeDisplayValue, localizeEducation } from '@/lib/localized-helpers';

interface JobCardProps {
  job: PublicJob;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const { mode } = useLanguageMode();
  const isEn = mode === 'en';
  const track = job.track ? getTrackById(job.track) : null;

  // direction display: prefer direction, fallback to track name
  const directionDisplay = job.direction || track?.name || '';
  // seniority display
  const directionWithLevel = job.seniority
    ? `${directionDisplay} · ${job.seniority}`
    : directionDisplay;

  // Tags: max 6
  const visibleTags = (job.tags || []).slice(0, 6);

  // Use unified helper for urgent badge
  const showUrgent = isUrgentActive(job);

  return (
    <Link
      href={`/jobs/${job.slug}`}
      onClick={() => trackEvent('job_view', { job_id: job.id, source: 'list', publication_id: job.id })}
      className="group grid gap-3 border-b border-white/[0.06] py-6 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-6 md:py-8"
    >
      {/* Index number */}
      <div className="md:col-span-1">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Title + badges + meta */}
      <div className="md:col-span-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {track && (
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {track.englishName}
            </span>
          )}
          {showUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
              <Zap className="h-2.5 w-2.5 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">{isEn ? 'Urgent' : '急招'}</span>
            </span>
          )}
          {job.featured && (
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
              <span className="text-[10px] font-medium text-accent uppercase tracking-wider">{isEn ? 'Featured' : '精选'}</span>
            </span>
          )}
        </div>

        <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-accent-light">
          {job.title}
        </h3>

        {/* Direction · Seniority + Job Code */}
        {(directionDisplay || job.public_job_code) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {directionDisplay && (
              <p className="text-xs text-muted-foreground">
                {directionWithLevel}
              </p>
            )}
            {job.public_job_code && <JobCode code={job.public_job_code} />}
          </div>
        )}

        {/* Summary */}
        {job.summary && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {job.summary}
          </p>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] leading-tight text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* City + Salary */}
      <div className="md:col-span-2">
        {job.city && (
          <p className="text-sm text-muted-foreground">
            <span className="text-xs text-muted-foreground/60">{isEn ? 'Location: ' : '工作地点：'}</span>{localizeCity(job.city, mode)}
          </p>
        )}
        {job.salary_display && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">{isEn ? 'Pay: ' : '薪资：'}</span>{job.salary_display}
          </p>
        )}
      </div>

      {/* Education / Experience */}
      <div className="md:col-span-2">
        {job.education && (
          <p className="text-sm text-muted-foreground">
            <span className="text-xs text-muted-foreground/60">{isEn ? 'Education: ' : '学历：'}</span>{localizeEducation(job.education, mode)}
          </p>
        )}
        {job.experience && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="text-xs text-muted-foreground/60">{isEn ? 'Experience: ' : '经验：'}</span>{localizeDisplayValue(job.experience, mode)}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-end md:col-span-2">
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
      </div>
    </Link>
  );
}
