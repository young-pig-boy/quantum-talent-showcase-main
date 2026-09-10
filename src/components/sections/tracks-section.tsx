'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getActiveTracks } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import { usePublicJobs } from '@/hooks/use-public-jobs';
import { useLanguageMode } from '@/lib/language-mode';
import { cn } from '@/lib/utils';

export function TracksSection() {
  const tracks = getActiveTracks();
  const { jobs, loading, error, retry } = usePublicJobs();
  const { mode } = useLanguageMode();

  // Aggregate job counts by track from real API data (single request, no N+1)
  const trackJobCounts: Record<string, number> = {};
  for (const job of jobs) {
    if (job.track) {
      trackJobCounts[job.track] = (trackJobCounts[job.track] || 0) + 1;
    }
  }

  return (
    <div id="quantum-tracks">
      {/* Section header */}
      <ScrollReveal className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-sm font-medium tracking-[0.15em] text-accent/60 uppercase">
            04
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        {mode !== 'en' && (
          <p className="mb-3 font-mono text-sm font-medium tracking-[0.2em] text-accent uppercase">
            Frontier Tracks
          </p>
        )}
        <h3 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
          {mode === 'en' ? 'Frontier Tracks' : '前沿赛道'}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          {mode === 'en'
            ? 'Explore quantum technology routes and their open positions'
            : '探索量子科技不同技术路线与对应岗位机会'}
        </p>
      </ScrollReveal>

      {/* Error state */}
      {error && (
        <ScrollReveal>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="mb-2 text-sm font-medium text-foreground">
              {mode === 'en' ? 'Failed to load track data' : '岗位数据加载失败'}
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

      {/* Numbered vertical alternating bands */}
      {!error && (
        <div className="space-y-px">
          {tracks.map((track, index) => {
            const isEven = index % 2 === 0;
            const jobCount = trackJobCounts[track.id] ?? (loading ? '...' : 0);

            return (
              <ScrollReveal key={track.id} delay={index * 0.05}>
                <Link
                  href={`/tracks/${track.id}`}
                  onClick={() => trackEvent('track_click', { track_id: track.id })}
                  className="group block border-t border-white/[0.06] py-8 transition-colors hover:bg-white/[0.02] sm:py-10"
                >
                  <div className="grid items-center gap-4 md:grid-cols-12 md:gap-8">
                    {/* Large number */}
                    <div className={cn('md:col-span-2', !isEven && 'md:order-3')}>
                      <span className="font-mono text-4xl font-light text-accent/20 transition-colors group-hover:text-accent/40 sm:text-5xl">
                        0{track.order}
                      </span>
                    </div>

                    {/* Content */}
                    <div className={cn('md:col-span-7', !isEven && 'md:order-1 md:col-span-7')}>
                      {mode !== 'en' && (
                        <p className="mb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:text-xs">
                          {track.englishName}
                        </p>
                      )}
                      <h4 className="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-accent-light sm:text-2xl">
                        {mode === 'en' ? track.englishName : track.name}
                      </h4>
                      <p className="max-w-lg text-sm leading-[1.7] text-muted-foreground">
                        {mode === 'en' ? track.enDescription : track.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className={cn('md:col-span-3', !isEven && 'md:order-2')}>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-accent">
                        <span>{mode === 'en' ? 'Explore Track' : '探索赛道'}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {loading ? '...' : jobCount} {mode === 'en' ? 'Open Positions' : '个开放岗位'}
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
