'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { EText } from '@/lib/language-mode';

export default function JobDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[JobDetail]', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="flex items-center justify-center pt-32 pb-20 sm:pt-40">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10">
            <p className="mb-3 text-lg font-medium text-foreground">
              <EText zh="页面加载失败" en="Failed to load this page" />
            </p>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              {error.message || (
                <EText zh="岗位数据加载失败，请稍后重试" en="Failed to load job data. Please try again later." />
              )}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-surface-glass-hover px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-surface-glass-hover"
              >
                <RefreshCw className="h-4 w-4" />
                <EText zh="重新加载" en="Reload" />
              </button>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-surface-glass"
              >
                <ArrowLeft className="h-4 w-4" />
                <EText zh="返回岗位列表" en="Back to Job Center" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
