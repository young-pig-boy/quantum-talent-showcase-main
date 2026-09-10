import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { getTrackById, siteConfig } from '@/lib/data';
import type { PublicJob } from '@/hooks/use-public-jobs';
import { JobCode } from '@/components/job/job-code';
import { EText, ZhOnly, ECity, EValue } from '@/lib/language-mode';

function getBaseUrl() {
  return `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TrackJobItem {
  id: string;
  slug: string;
  public_job_code: string | null;
  title: string;
  city: string;
  experience: string;
  direction: string;
  seniority: string;
}

async function getTrackJobs(trackId: string): Promise<TrackJobItem[]> {
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/public/jobs?track=${encodeURIComponent(trackId)}&limit=20`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.jobs || []) as PublicJob[]).map((job) => ({
      id: job.id,
      slug: job.slug,
      public_job_code: job.public_job_code,
      title: job.title,
      city: job.city,
      experience: job.experience,
      direction: job.direction || '',
      seniority: job.seniority || '',
    }));
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const track = getTrackById(id);
  if (!track) {
    return { title: '赛道未找到' };
  }
  return {
    title: `${track.name} | ${siteConfig.platformName}`,
    description: track.description,
  };
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { id } = await params;
  const track = getTrackById(id);

  if (!track || track.status !== 'active') {
    notFound();
  }

  const trackJobs = await getTrackJobs(track.id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
          {/* Gradient background */}
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{ background: track.heroGradient }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              {/* Back link */}
              <Link
                href="/tracks"
                className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <EText zh="全部赛道" en="All Tracks" />
              </Link>

              <div className="grid gap-6 md:grid-cols-12">
                {/* Large number */}
                <div className="md:col-span-2">
                  <span className="font-mono text-7xl font-light text-accent/30 lg:text-8xl">
                    0{track.order}
                  </span>
                </div>

                {/* Title */}
                <div className="md:col-span-10">
                  <ZhOnly>
                    <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                      {track.englishName}
                    </p>
                  </ZhOnly>
                  <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    <EText zh={track.name} en={track.englishName} display />
                  </h1>
                  <p className="max-w-2xl text-base leading-[1.8] text-muted-foreground sm:text-lg">
                    <EText zh={track.description} en={track.enDescription} />
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Overview - left-right split */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-12 md:gap-8">
              <ScrollReveal className="md:col-span-4">
                <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  Overview
                </p>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  <EText zh="赛道概览" en="Overview" display />
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1} className="md:col-span-8">
                <p className="text-base leading-[1.8] text-muted-foreground sm:text-lg">
                  {track.overview}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Tech Routes - numbered list */}
        {track.techRoutes.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ScrollReveal className="mb-12">
                <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  Technical Routes
                </p>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  <EText zh="技术路线" en="Technical Routes" display />
                </h2>
              </ScrollReveal>
              <div className="border-t border-white/[0.06]">
                {track.techRoutes.map((route, index) => (
                  <ScrollReveal key={route.id} delay={index * 0.05}>
                    <div className="grid gap-4 border-b border-white/[0.06] py-8 md:grid-cols-12 md:gap-8">
                      <div className="md:col-span-1">
                        <span className="font-mono text-sm text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="md:col-span-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          {route.name}
                        </h3>
                      </div>
                      <div className="md:col-span-7">
                        <p className="leading-[1.7] text-muted-foreground">
                          {route.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Applications + Talent Types - two column */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              {/* Applications */}
              <ScrollReveal>
                <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  Applications
                </p>
                <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                  <EText zh="应用方向" en="Applications" display />
                </h2>
                <ul className="space-y-4">
                  {track.applications.map((app, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="leading-[1.7] text-muted-foreground">{app}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              {/* Talent Types */}
              <ScrollReveal delay={0.1}>
                <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                  Talent Profiles
                </p>
                <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
                  <EText zh="人才类型" en="Talent Profiles" display />
                </h2>
                <div className="space-y-6">
                  {track.talentTypes.map((talent, index) => (
                    <div key={index} className="border-l border-border pl-4">
                      <h3 className="mb-1 text-base font-medium text-foreground">
                        {talent.name}
                      </h3>
                      <p className="text-sm leading-[1.7] text-muted-foreground">
                        {talent.description}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Related Jobs - magazine style */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-12">
              <div className="flex items-end justify-between">
                <div>
                  <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                    Open Positions
                  </p>
                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                    <EText zh="相关岗位" en="Related Positions" display />
                  </h2>
                </div>
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <EText zh="查看全部" en="View All" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>

            {trackJobs.length > 0 ? (
              <div className="border-t border-white/[0.06]">
                {trackJobs.map((job, index) => (
                  <ScrollReveal key={job.id} delay={index * 0.05}>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="group grid gap-3 border-b border-white/[0.06] py-6 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-6"
                    >
                      <div className="md:col-span-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="md:col-span-6">
                        <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-accent-light">
                          {job.title}
                        </h3>
                        {(job.direction || job.public_job_code) && (
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {job.direction && (
                              <p className="text-xs text-muted-foreground">
                                {job.direction}{job.seniority ? ` · ${job.seniority}` : ''}
                              </p>
                            )}
                            {job.public_job_code && <JobCode code={job.public_job_code} />}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground"><ECity city={job.city} /></p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground"><EValue value={job.experience} /></p>
                      </div>
                      <div className="flex items-center justify-end md:col-span-1">
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="border-t border-white/[0.06] py-20 text-center">
                <p className="text-sm text-muted-foreground">
                  <EText zh="当前暂无开放岗位" en="No open positions currently" />
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA - liquid glass */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <LiquidGlass variant="strong" className="p-8 sm:p-12">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                      对 {track.name} 感兴趣？
                    </h2>
                    <p className="text-muted-foreground">
                      <EText
                        zh="查看相关岗位，或直接联系我们，加入量子人才会客厅。"
                        en="Browse related positions, or contact us directly to join the quantum talent network."
                      />
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/opportunities"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-glass-hover px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-surface-glass-hover"
                    >
                      <EText zh="查看岗位机会" en="View Positions" />
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`mailto:${siteConfig.contactEmail}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-surface-glass"
                    >
                      <EText zh="邮件咨询" en="Email Us" />
                    </Link>
                  </div>
                </div>
              </LiquidGlass>
            </ScrollReveal>
          </div>
        </section>

        {/* Back link */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/tracks"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <EText zh="返回全部赛道" en="Back to All Tracks" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
