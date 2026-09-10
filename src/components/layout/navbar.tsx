'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, ArrowRight, Sun, Moon, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import {
  brandConfig,
  ctaNavItem,
  navItems,
  jobFastLaneSubItems,
  type NavItem,
  type SubNavItem,
} from '@/lib/data/navigation';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useLanguageMode } from '@/lib/language-mode';
import { useThemeContext } from '@/components/theme-provider';
import { ScrollProgress } from '@/components/layout/scroll-progress';
import { JobFastLaneSubNav } from '@/components/layout/job-fast-lane-sub-nav';

/**
 * All section IDs in document order.
 * The scroll spy iterates these to find the active section.
 */
const allSectionIds = [
  'hero',
  'why',
  'job-fast-lane',
  'job-center',
  'urgent-jobs',
  'featured-jobs',
  'quantum-tracks',
  'partners',
  'join-network',
] as const;

/** Sections that belong to the "Job Fast Lane" primary nav item. */
const JOB_FAST_LANE_MEMBERS = new Set([
  'job-fast-lane',
  'job-center',
  'urgent-jobs',
  'featured-jobs',
  'quantum-tracks',
]);

/** Sub-section IDs for the secondary nav. */
const SUB_SECTION_IDS = new Set([
  'job-center',
  'urgent-jobs',
  'featured-jobs',
  'quantum-tracks',
]);

/**
 * Derive the primary nav active section ID from the raw scroll spy result.
 */
function derivePrimaryActive(rawId: string | null): string | null {
  if (!rawId) return null;
  if (rawId === 'hero' || rawId === 'why') return 'hero';
  if (JOB_FAST_LANE_MEMBERS.has(rawId)) return 'job-fast-lane';
  if (rawId === 'partners') return 'partners';
  if (rawId === 'join-network') return 'join-network';
  return null;
}

/**
 * Derive the secondary nav active section ID from the raw scroll spy result.
 */
function deriveSecondaryActive(rawId: string | null): string | null {
  if (!rawId) return null;
  if (SUB_SECTION_IDS.has(rawId)) return rawId;
  return null;
}

function scrollToSection(sectionId: string) {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  // Hero section: scroll to absolute top
  if (sectionId === 'hero') {
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', '/');
    return;
  }

  const element = document.getElementById(sectionId);
  if (!element) return;

  element.scrollIntoView({
    behavior: prefersReduced ? 'auto' : 'smooth',
  });

  const item =
    navItems.find((navItem) => navItem.sectionId === sectionId) ??
    ctaNavItem;
  if (item) {
    history.replaceState(null, '', item.href);
  }
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Single scroll spy watching ALL sections in document order
  const rawActiveId = useScrollSpy(isHome ? [...allSectionIds] : [], {
    offset: 160,
  });

  // Derive primary and secondary active states
  const primaryActiveId = useMemo(
    () => derivePrimaryActive(rawActiveId),
    [rawActiveId],
  );
  const secondaryActiveId = useMemo(
    () => deriveSecondaryActive(rawActiveId),
    [rawActiveId],
  );
  const isSubNavVisible = isHome && primaryActiveId === 'job-fast-lane';

  const { theme, toggleTheme } = useThemeContext();
  const { mode, setMode } = useLanguageMode();

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const navContainerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = () => {
    if (!isHome || !primaryActiveId) {
      setIndicatorStyle(null);
      return;
    }

    // Find the nav item that matches the primary active section
    const activeNavItem = navItems.find(
      (item) => item.sectionId === primaryActiveId,
    );
    if (!activeNavItem) {
      setIndicatorStyle(null);
      return;
    }

    const anchor = itemRefs.current[activeNavItem.sectionId];
    const container = navContainerRef.current;

    if (!anchor || !container || anchor.offsetParent === null) {
      setIndicatorStyle(null);
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      left: anchorRect.left - containerRect.left,
      top: anchorRect.top - containerRect.top,
      width: anchorRect.width,
      height: anchorRect.height,
    });
  };

  useEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryActiveId, isHome, mobileOpen]);

  useEffect(() => {
    if (!isHome) return;

    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryActiveId, isHome]);

  useEffect(() => {
    if (!isHome) return;

    const hash = window.location.hash.replace('#', '');
    const validIds = allSectionIds as readonly string[];
    if (!hash || !validIds.includes(hash)) return;

    const timer = setTimeout(() => {
      if (hash === 'hero') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isHome]);

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    trackEvent('job_view', { target: `nav_${item.id}` });

    // Page routes: let the browser/Link handle navigation naturally
    if (item.isPageRoute) return;

    if (!isHome) return;

    event.preventDefault();
    // Only scroll — active state is determined by scroll position, not click
    scrollToSection(item.sectionId);
  };

  const handleLogoClick = () => {
    trackEvent('job_view', { target: 'nav_logo' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className="relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-full border border-border bg-surface-glass px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-colors duration-300 dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
        aria-label="主导航"
      >
        {/* Brand — external link to X-GIANTS homepage */}
        <a
          href={brandConfig.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLogoClick}
          aria-label={`${brandConfig.name}官网（在新标签页打开）`}
          className="group flex shrink-0 flex-col items-center rounded-full px-3 py-1 transition-colors hover:bg-surface-glass focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandConfig.logo}
            alt={brandConfig.logoAlt}
            className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
          />
          <span className="mt-0.5 text-[9px] font-light leading-none tracking-wide text-muted-foreground transition-colors duration-300 group-hover:text-foreground hidden sm:block">
            {brandConfig.logoSubtext}
          </span>
        </a>

        {/* Desktop nav — center */}
        <div
          ref={navContainerRef}
          className="relative hidden items-center md:flex"
        >
          {isHome && indicatorStyle && (
            <div
              className="pointer-events-none absolute rounded-full border border-border bg-surface-glass shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                top: indicatorStyle.top,
                width: indicatorStyle.width,
                height: indicatorStyle.height,
              }}
              aria-hidden="true"
            />
          )}

          {navItems.map((item) => {
            const navHref = item.isPageRoute
              ? item.href
              : (isHome ? item.href : `/${item.href}`);

            const isActive = primaryActiveId === item.sectionId;

            const linkClasses = cn(
              'relative z-10 rounded-full px-4 py-2 text-[13px] font-light tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            );

            if (item.isPageRoute) {
              return (
                <Link
                  key={item.id}
                  href={navHref}
                  onClick={() => {
                    trackEvent('job_view', { target: `nav_${item.id}` });
                  }}
                  aria-current={
                    primaryActiveId === item.sectionId ? 'location' : undefined
                  }
                  className={linkClasses}
                >
                  {mode === 'en' ? (item.labelEn ?? item.label) : item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.id}
                ref={(element) => {
                  itemRefs.current[item.sectionId] = element;
                }}
                href={navHref}
                onClick={(event) => handleNavClick(event, item)}
                aria-current={
                  primaryActiveId === item.sectionId ? 'location' : undefined
                }
                className={linkClasses}
              >
                {mode === 'en' ? (item.labelEn ?? item.label) : item.label}
              </a>
            );
          })}
        </div>

        {/* Right — Language toggle + Theme toggle + mobile menu trigger */}
        <div className="flex items-center gap-1">
          {/* Language mode toggle — 中 | E（仅切换固定 UI 文案，不影响任何业务状态） */}
          <div
            className="flex items-center rounded-full border border-border bg-surface-glass p-0.5"
            role="group"
            aria-label="语言切换 / Language"
          >
            <button
              type="button"
              onClick={() => setMode('zh')}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
                mode === 'zh'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={mode === 'zh'}
            >
              中
            </button>
            <button
              type="button"
              onClick={() => setMode('en')}
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-medium leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
                mode === 'en'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={mode === 'en'}
            >
              E
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-glass hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            aria-label={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
          >
            {theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-glass hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 md:hidden"
                aria-label="打开导航菜单"
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              id="mobile-navigation"
              className="w-[280px] border-border bg-popover/95 p-0 backdrop-blur-xl"
            >
              <SheetTitle className="sr-only">主导航菜单</SheetTitle>

              <div className="flex h-full flex-col p-6">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = primaryActiveId === item.sectionId;
                    const mobileClasses = cn(
                      'flex items-center rounded-xl px-4 py-3 text-[15px] font-light tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    );

                    // "岗位快车道" with expandable sub-items
                    if (item.id === 'job-fast-lane') {
                      return (
                        <MobileSubNav
                          key={item.id}
                          item={item}
                          subItems={jobFastLaneSubItems}
                          isHome={isHome}
                          primaryActiveId={primaryActiveId}
                          secondaryActiveId={secondaryActiveId}
                          onClose={() => setMobileOpen(false)}
                        />
                      );
                    }

                    if (item.isPageRoute) {
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => {
                            trackEvent('job_view', {
                              target: `mobile_nav_${item.id}`,
                            });
                            setMobileOpen(false);
                          }}
                          aria-current={
                            primaryActiveId === item.sectionId
                              ? 'location'
                              : undefined
                          }
                          className={mobileClasses}
                        >
                          {mode === 'en' ? (item.labelEn ?? item.label) : item.label}
                        </Link>
                      );
                    }

                    return (
                      <a
                        key={item.id}
                        href={isHome ? item.href : `/${item.href}`}
                        onClick={(event) => {
                          trackEvent('job_view', {
                            target: `mobile_nav_${item.id}`,
                          });

                          if (!isHome) {
                            setMobileOpen(false);
                            return;
                          }

                          event.preventDefault();
                          setMobileOpen(false);
                          setTimeout(() => scrollToSection(item.sectionId), 200);
                        }}
                        aria-current={
                          primaryActiveId === item.sectionId
                            ? 'location'
                            : undefined
                        }
                        className={mobileClasses}
                      >
                        {mode === 'en' ? (item.labelEn ?? item.label) : item.label}
                      </a>
                    );
                  })}
                </div>

                <div className="mt-auto border-t border-border pt-4">
                  {ctaNavItem.isPageRoute ? (
                    <Link
                      href={ctaNavItem.href}
                      onClick={() => {
                        trackEvent('job_view', {
                          target: 'mobile_nav_explore',
                        });
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    >
                      {mode === 'en'
                        ? (ctaNavItem.labelEn ?? ctaNavItem.label)
                        : ctaNavItem.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <a
                      href={isHome ? ctaNavItem.href : `/${ctaNavItem.href}`}
                      onClick={(event) => {
                        trackEvent('job_view', {
                          target: 'mobile_nav_explore',
                        });

                        if (!isHome) {
                          setMobileOpen(false);
                          return;
                        }

                        event.preventDefault();
                        setMobileOpen(false);
                        setTimeout(
                          () => scrollToSection(ctaNavItem.sectionId),
                          200,
                        );
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    >
                      {mode === 'en'
                        ? (ctaNavItem.labelEn ?? ctaNavItem.label)
                        : ctaNavItem.label}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <ScrollProgress />
      </nav>

      {/* Secondary navigation — fixed overlay, appears when in Job Fast Lane */}
      <div
        className={cn(
          'flex justify-center pt-2 transition-all duration-300 ease-out',
          isSubNavVisible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1.5 opacity-0',
        )}
        aria-hidden={!isSubNavVisible}
      >
        <JobFastLaneSubNav activeId={secondaryActiveId} />
      </div>
    </header>
  );
}

/**
 * Mobile sub-navigation for "岗位快车道"
 */
function MobileSubNav({
  item,
  subItems,
  isHome,
  primaryActiveId,
  secondaryActiveId,
  onClose,
}: {
  item: NavItem;
  subItems: SubNavItem[];
  isHome: boolean;
  primaryActiveId: string | null;
  secondaryActiveId: string | null;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = primaryActiveId === item.sectionId;
  const { mode: subMode } = useLanguageMode();

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-light tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        )}
      >
        {subMode === 'en' ? (item.labelEn ?? item.label) : item.label}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
          {subItems.map((sub) => {
            const subHref = isHome ? sub.href : `/${sub.href}`;
            const isSubActive =
              sub.sectionId != null && secondaryActiveId === sub.sectionId;

            const subClasses = cn(
              'flex items-center rounded-lg px-3 py-2.5 text-[13px] font-light tracking-wide transition-colors focus:outline-none',
              isSubActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            );

            return (
              <a
                key={sub.id}
                href={subHref}
                onClick={(e) => {
                  e.preventDefault();
                  trackEvent('job_view', { target: `mobile_subnav_${sub.id}` });
                  onClose();
                  if (isHome && sub.sectionId) {
                    setTimeout(() => scrollToSection(sub.sectionId!), 200);
                  }
                }}
                className={subClasses}
              >
                {subMode === 'en' ? (sub.labelEn ?? sub.label) : sub.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
