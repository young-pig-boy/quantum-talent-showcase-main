'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function TrackDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[TrackDetail]', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="flex items-center justify-center pt-32 pb-20 sm:pt-40">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10">
            <p className="mb-3 text-lg font-medium text-foreground">页面加载失败</p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {error.message || '赛道数据加载失败，请稍后重试'}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-surface-glass-hover px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-glass-hover"
              >
                <RefreshCw className="h-4 w-4" />
                重新加载
              </button>
              <Link
                href="/#quantum-tracks"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-surface-glass"
              >
                <ArrowLeft className="h-4 w-4" />
                返回赛道列表
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
