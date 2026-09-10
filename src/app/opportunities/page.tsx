'use client';

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { JobCard } from '@/components/job/job-card';
import { JobFilter, getFilterCount } from '@/components/job/job-filter';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicJobs } from '@/hooks/use-public-jobs';
import { useLanguageMode } from '@/lib/language-mode';

const PAGE_SIZE = 20;

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const { mode } = useLanguageMode();

  // --- Read URL query params for initial filter state ---
  const urlUrgent = searchParams.get('urgent') === 'true';
  const urlFeatured = searchParams.get('featured') === 'true';
  const urlTrack = searchParams.get('track') || '';

  // --- Filter state ---
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(urlTrack || 'all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [page, setPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  // Aggregation mode from URL
  const [urgentMode] = useState(urlUrgent);
  const [featuredMode] = useState(urlFeatured);

  // --- City options (fetched from API) ---
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  // --- Debounce search ---
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchInput]);

  // --- Fetch city options ---
  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/jobs/filter-options')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.cities) {
          setCityOptions(data.cities);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // --- Reset page when filters change ---
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    setPage(1);
  }, []);

  const handleTrackChange = useCallback((val: string) => {
    setSelectedTrack(val);
    setPage(1);
  }, []);

  const handleCityChange = useCallback((val: string) => {
    setSelectedCity(val);
    setPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedTrack('all');
    setSelectedCity('all');
    setPage(1);
  }, []);

  const handleToggleFilterPanel = useCallback(() => {
    setFilterPanelOpen((v) => !v);
  }, []);

  const offset = (page - 1) * PAGE_SIZE;

  // --- Server-side query ---
  const { jobs, total, loading, error, retry } = usePublicJobs({
    search: debouncedSearch || undefined,
    track: selectedTrack !== 'all' ? selectedTrack : undefined,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    limit: PAGE_SIZE,
    offset,
    urgent: urgentMode || undefined,
    featured: featuredMode || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = selectedTrack !== 'all' || selectedCity !== 'all' || debouncedSearch !== '';
  const filterCount = getFilterCount(selectedTrack, selectedCity);

  // --- Page title based on entry mode ---
  const pageTitle = useMemo(() => {
    if (urgentMode) return { eyebrow: 'Urgent Hiring', title: '急招岗位', titleEn: 'Urgent Hiring', desc: '当前急需填补的岗位机会', descEn: 'Positions that need filling right now' };
    if (featuredMode) return { eyebrow: 'Featured Positions', title: '精选岗位', titleEn: 'Featured Positions', desc: '猎头团队重点关注的岗位机会', descEn: 'Opportunities flagged by our headhunting team' };
    return { eyebrow: 'Opportunities', title: '岗位中心', titleEn: 'Job Center', desc: '浏览量子科技领域最新开放岗位', descEn: 'Browse the latest open positions in quantum technology' };
  }, [urgentMode, featuredMode]);

  // --- Pagination helpers ---
  const goToPage = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  // Scroll to search bar when page changes
  const searchBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (page > 1 && searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <ScrollReveal>
            <div className="mb-10">
              <div className="mb-3 flex items-center gap-3">
                {!(mode === 'en' && pageTitle.eyebrow === pageTitle.titleEn) && (
                  <p className="font-mono text-xs font-medium tracking-[0.2em] text-accent uppercase">
                    {pageTitle.eyebrow}
                  </p>
                )}
                {urgentMode && <Zap className="h-4 w-4 text-amber-400" />}
                {featuredMode && <Star className="h-4 w-4 text-accent" />}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {mode === 'en' ? pageTitle.titleEn : pageTitle.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-[1.7] text-muted-foreground">
                {mode === 'en' ? pageTitle.descEn : pageTitle.desc}
                {!loading && (
                  <span>
                    {' '}{mode === 'en' ? `${total} open positions in total.` : `当前共 ${total} 个岗位。`}
                  </span>
                )}
              </p>
            </div>
          </ScrollReveal>

          {/* Search & Filter */}
          <div ref={searchBarRef}>
            <ScrollReveal delay={0.05}>
              <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={mode === 'en' ? 'Search jobs by title or location...' : '搜索岗位名称或城市...'}
                      className="w-full rounded-xl border border-border bg-card py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-accent/30 focus:ring-2 focus:ring-accent/10 focus:outline-none"
                    />
                  </div>

                  {/* Filter toggle button */}
                  <button
                    onClick={handleToggleFilterPanel}
                    className="flex h-[46px] items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-all hover:border-border hover:text-foreground"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {mode === 'en' ? 'Filters' : '筛选'}
                    {filterCount > 0 && (
                      <span className="ml-0.5 rounded-full bg-accent/20 px-1.5 text-xs text-accent-light">
                        · {filterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Active mode indicator + clear */}
                {(urgentMode || featuredMode) && (
                  <div className="mt-3 flex items-center gap-2">
                    {urgentMode && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                        <Zap className="h-3 w-3" />
                        {mode === 'en' ? 'Urgent Hiring' : '急招岗位'}
                      </span>
                    )}
                    {featuredMode && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        <Star className="h-3 w-3" />
                        {mode === 'en' ? 'Featured Positions' : '精选岗位'}
                      </span>
                    )}
                    <a
                      href="/opportunities"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {mode === 'en' ? 'View All Jobs' : '查看全部岗位'}
                    </a>
                  </div>
                )}

                {/* Filter panel and chips */}
                <div className="mt-4">
                  <JobFilter
                    selectedTrack={selectedTrack}
                    onTrackChange={handleTrackChange}
                    selectedCity={selectedCity}
                    onCityChange={handleCityChange}
                    cities={cityOptions}
                    filterPanelOpen={filterPanelOpen}
                    onToggleFilterPanel={handleToggleFilterPanel}
                    onClearAll={handleClearAll}
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Job list */}
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6">
                    <Skeleton className="mb-3 h-6 w-1/3" />
                    <Skeleton className="mb-2 h-4 w-1/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-red-400/50" />
                <p className="mb-4 text-lg font-medium text-foreground">
                  {mode === 'en' ? 'Failed to load positions' : '加载失败'}
                </p>
                <p className="mb-6 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={retry}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-glass-hover px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-glass-hover"
                >
                  {mode === 'en' ? 'Retry' : '重新加载'}
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-16 text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                {hasFilters || urgentMode || featuredMode ? (
                  <>
                    <p className="mb-2 text-lg font-medium text-foreground">
                      {mode === 'en'
                        ? urgentMode
                          ? 'No urgent positions right now'
                          : featuredMode
                            ? 'No featured positions right now'
                            : 'No matching positions'
                        : urgentMode
                          ? '当前暂无急招岗位'
                          : featuredMode
                            ? '暂无精选岗位'
                            : '未找到匹配的岗位'}
                    </p>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {mode === 'en'
                        ? urgentMode || featuredMode
                          ? 'Browse all open opportunities'
                          : 'No results under the current search or filters — try adjusting them.'
                        : urgentMode || featuredMode
                          ? '可以查看全部开放机会'
                          : '当前搜索或筛选条件下暂无匹配结果，试试调整条件'}
                    </p>
                    <a
                      href="/opportunities"
                      className="inline-flex items-center gap-2 rounded-full bg-surface-glass-hover px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-glass-hover"
                    >
                      {mode === 'en' ? 'View All Jobs' : '查看全部岗位'}
                    </a>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-lg font-medium text-foreground">
                      {mode === 'en' ? 'No Open Positions' : '暂无开放岗位'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'en'
                        ? 'There are no open positions at the moment. Please check back later.'
                        : '当前没有正在招聘的岗位，请稍后再来看看'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="border-t border-white/[0.06]">
                  {jobs.map((job, index) => (
                    <div
                      key={job.id}
                      className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.015]"
                    >
                      <ScrollReveal delay={index * 0.03}>
                        <div className="py-5">
                          <JobCard job={job} index={offset + index} />
                        </div>
                      </ScrollReveal>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-1">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                      aria-label={mode === 'en' ? 'Previous page' : '上一页'}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {pageNumbers.map((p, i) =>
                      p === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="inline-flex h-10 w-10 items-center justify-center text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                            p === page
                              ? 'border border-accent/30 bg-accent/10 text-accent-light'
                              : 'border border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                      aria-label={mode === 'en' ? 'Next page' : '下一页'}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <span className="ml-4 text-xs text-muted-foreground">
                      {mode === 'en'
                        ? `Page ${page} of ${totalPages} · ${total} jobs`
                        : `第 ${page}/${totalPages} 页，共 ${total} 个岗位`}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function OpportunitiesPage() {
  // useSearchParams() 必须在 Suspense 边界内使用，否则静态预渲染会失败
  return (
    <Suspense fallback={null}>
      <OpportunitiesContent />
    </Suspense>
  );
}
