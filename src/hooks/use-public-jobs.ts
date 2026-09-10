'use client';

import { useState, useEffect, useCallback } from 'react';
import { isUrgentActive } from '@/lib/public-job';
import type { PublicJob } from '@/lib/public-job';

// Re-export 共享纯类型 / 纯 helper，保持现有调用方（Client 组件）兼容
export type { PublicJob };
export { isUrgentActive };

interface UsePublicJobsOptions {
  search?: string;
  track?: string;
  city?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
  urgent?: boolean;
}

interface UsePublicJobsResult {
  jobs: PublicJob[];
  total: number;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function usePublicJobs(options: UsePublicJobsOptions = {}): UsePublicJobsResult {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.search) params.set('search', options.search);
      if (options.track) params.set('track', options.track);
      if (options.city) params.set('city', options.city);
      if (options.limit) params.set('limit', String(options.limit));
      if (options.offset !== undefined && options.offset > 0) params.set('offset', String(options.offset));
      if (options.featured) params.set('featured', 'true');
      if (options.urgent) params.set('urgent', 'true');

      const res = await fetch(`/api/public/jobs?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: '请求失败' }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [options.search, options.track, options.city, options.limit, options.offset, options.featured, options.urgent, retryKey]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return { jobs, total, loading, error, retry };
}

interface UsePublicJobResult {
  job: PublicJob | null;
  loading: boolean;
  error: string | null;
}

export function usePublicJob(slug: string): UsePublicJobResult {
  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('无效的岗位标识');
      return;
    }

    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/public/jobs/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('岗位不存在或已下架');
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setJob(data.job || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
          setJob(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { job, loading, error };
}
