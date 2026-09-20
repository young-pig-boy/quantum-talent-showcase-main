import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Copy,
  MessageCircle,
  Calendar,
  Zap,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LJobTitle, LJobDirection, LJobSeniority, LJobSummary } from '@/components/job/localized-job-fields';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { ShareButton } from '@/components/job/share-button';
import { ApplyDrawer } from '@/components/job/apply-drawer';
import { JobCode } from '@/components/job/job-code';
import { JobViewTracker } from '@/components/job/job-view-tracker';
import { getTrackById, siteConfig } from '@/lib/data';
import { contact } from '@/lib/contact';
import { isUrgentActive } from '@/lib/public-job';
import { getPublicJobBySlug, getRelatedJobs } from '@/lib/public-jobs/server';
import { EText, EnOnly, ECity, EValue } from '@/lib/language-mode';

function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    return format(new Date(isoString), 'yyyy-MM-dd');
  } catch {
    return isoString.slice(0, 10);
  }
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublicJobBySlug(id);

  if (!job) return { title: '岗位未找到' };

  return {
    title: `${job.title} | ${siteConfig.platformName}`,
    description: job.summary || `${job.title} - ${job.city}`,
    openGraph: {
      title: `${job.title} | ${siteConfig.platformName}`,
      description: job.summary || `${job.title} - ${job.city}`,
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getPublicJobBySlug(id);

  if (!job) notFound();

  const track = job.track ? getTrackById(job.track) : null;
  const relatedJobs = await getRelatedJobs(job.track, job.slug);

  return (
    <main className="min-h-screen bg-background">
      <JobViewTracker jobId={job.id} />
      <Navbar />

      <article className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <ScrollReveal>
            <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <EText zh="岗位列表" en="Job List" />
              </Link>
              {track && (
                <>
                  <span>/</span>
                  <Link
                    href={`/tracks/${track.id}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {track.name}
                  </Link>
                </>
              )}
            </div>
          </ScrollReveal>

          {/* Job header */}
          <ScrollReveal delay={0.05}>
            <div className="mb-12 border-b border-white/[0.06] pb-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {track && (
                  <Link
                    href={`/tracks/${track.id}`}
                    className="font-mono text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:text-accent"
                  >
                    {track.englishName}
                  </Link>
                )}
                {isUrgentActive(job) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                      <EText zh="急招" en="Urgent" />
                    </span>
                  </span>
                )}
              </div>

              <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <LJobTitle job={job} />
              </h1>

              {/* Job code — 便于候选人在沟通/投递时引用 */}
              {job.public_job_code && (
                <div className="mb-3">
                  <JobCode code={job.public_job_code} size="md" />
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <EText zh="工作地点：" en="Location: " />
                  {job.city ? <ECity city={job.city} /> : <EText zh="待确认" en="TBD" />}
                </span>
                {job.salary_display && (
                  <>
                    <span className="text-muted-foreground/30">|</span>
                    <span><EText zh="薪资：" en="Compensation: " />{job.salary_display}</span>
                  </>
                )}
                {!job.salary_display && (
                  <>
                    <span className="text-muted-foreground/30">|</span>
                    <span><EText zh="薪资：" en="Compensation: " /><EText zh="待确认" en="TBD" /></span>
                  </>
                )}
                <span className="text-muted-foreground/30">|</span>
                <span><EText zh="学历要求：" en="Education: " /><EValue value={job.education} /></span>
                <span className="text-muted-foreground/30">|</span>
                <span><EText zh="经验要求：" en="Experience: " /><EValue value={job.experience} /></span>
                {job.seniority && (
                  <>
                    <span className="text-muted-foreground/30">|</span>
                    <span><EText zh="职级：" en="Seniority: " /><LJobSeniority job={job} /></span>
                  </>
                )}
                {job.published_at && (
                  <>
                    <span className="text-muted-foreground/30">|</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <EText zh="发布时间：" en="Posted: " />
                      {formatDate(job.published_at)}
                    </span>
                  </>
                )}
              </div>

              {/* E Mode note — only visible when language is EN */}
              <EnOnly>
                <p className="mt-4 text-xs text-muted-foreground/70">
                  Job details are currently available in Chinese.
                </p>
              </EnOnly>

              {/* Track / Direction */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {track && (
                  <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {track.name}
                  </span>
                )}
                {job.direction && (
                  <span className="inline-block rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-accent-light">
                    <LJobDirection job={job} />
                  </span>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Two-column layout: 2/3 content + 1/3 sidebar */}
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left: content (2/3) */}
            <div className="space-y-12 lg:col-span-2">
              {/* Summary — dedicated job summary field */}
              {job.summary && (
                <ScrollReveal delay={0.1}>
                  <div>
                    <p className="mb-2 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                      Overview
                    </p>
                    <h2 className="mb-4 text-2xl font-bold text-foreground">
                      <EText zh="岗位简介" en="Overview" />
                    </h2>
                    <p className="text-lg leading-[1.8] text-foreground">
                      <LJobSummary job={job} />
                    </p>
                  </div>
                </ScrollReveal>
              )}

              {/* Responsibilities */}
              <ScrollReveal delay={0.15}>
                <div>
                  <p className="mb-2 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                    Responsibilities
                  </p>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    <EText zh="岗位职责" en="Responsibilities" />
                  </h2>
                  <ul className="space-y-4">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="mt-1 font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="leading-[1.7] text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <ScrollReveal delay={0.2}>
                  <div>
                    <p className="mb-2 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                      Requirements
                    </p>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                      <EText zh="任职要求" en="Requirements" />
                    </h2>
                    <ul className="space-y-4">
                      {job.requirements.map((item, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="mt-1 font-mono text-xs text-muted-foreground">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="leading-[1.7] text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              )}

              {/* Related jobs */}
              {relatedJobs.length > 0 && (
                <ScrollReveal delay={0.25}>
                  <div>
                    <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                      Related Positions
                    </p>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">
                      <EText zh="同赛道岗位" en="Related Positions" />
                    </h2>
                    <div className="border-t border-white/[0.06]">
                      {relatedJobs.map((rj, index) => (
                        <Link
                          key={rj.id}
                          href={`/jobs/${rj.slug}`}
                          className="group grid gap-3 border-b border-white/[0.06] py-5 transition-colors hover:bg-white/[0.015] md:grid-cols-12 md:items-center md:gap-4"
                        >
                          <div className="md:col-span-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="md:col-span-8">
                            <h3 className="text-base font-medium text-foreground transition-colors group-hover:text-accent-light">
                              {rj.title}
                            </h3>
                            {rj.public_job_code && (
                              <JobCode code={rj.public_job_code} className="mt-0.5" />
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">{rj.city}</p>
                          </div>
                          <div className="flex items-center justify-end md:col-span-1">
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>

            {/* Right: sticky sidebar (1/3) */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <ScrollReveal delay={0.15}>
                  <LiquidGlass variant="strong" className="p-6 sm:p-8">
                    <div className="space-y-6">
                      {/* Apply buttons */}
                      <div className="space-y-3">
                        <ApplyDrawer job={job}>
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-glass-hover px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-surface-glass-hover">
                            <Mail className="h-4 w-4" />
                            <EText zh="投递岗位" en="Apply Now" />
                          </button>
                        </ApplyDrawer>
                        <ApplyDrawer job={job} initialTab="wechat">
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-surface-glass">
                            <MessageCircle className="h-4 w-4" />
                            <EText zh="微信咨询" en="WeChat Consult" />
                          </button>
                        </ApplyDrawer>
                        <ShareButton job={job} />
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      {/* Contact info */}
                      <div className="space-y-4">
                        <div>
                          <p className="mb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                            Email
                          </p>
                          <p className="flex items-center gap-2 text-sm text-foreground">
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            {siteConfig.contactEmail}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                            WeChat
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.consultantName}</p>
                          <p className="text-sm text-foreground">{siteConfig.wechatId}</p>
                        </div>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      {/* QR Code */}
                      <div>
                        <p className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                          Scan to Connect
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={siteConfig.wechatQrCode}
                          alt="WeChat QR Code"
                          className="h-32 w-32 rounded-lg bg-surface-glass object-contain"
                        />
                      </div>
                    </div>
                  </LiquidGlass>
                </ScrollReveal>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Mobile sticky bottom bar */}
      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-3">
          <ApplyDrawer job={job}>
            <button className="flex-1 rounded-xl bg-surface-glass-hover px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-surface-glass-hover">
              <EText zh="投递岗位" en="Apply" />
            </button>
          </ApplyDrawer>
          <ApplyDrawer job={job} initialTab="wechat">
            <button className="flex-1 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-surface-glass">
              <EText zh="咨询" en="Consult" />
            </button>
          </ApplyDrawer>
        </div>
      </div>

      <Footer />
    </main>
  );
}
