'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { JobFilterState } from '@/lib/types';

const STORAGE_KEY = 'quantum-job-filters';

export function useFilterState(): {
  filters: JobFilterState;
  setFilters: React.Dispatch<React.SetStateAction<JobFilterState>>;
  updateFilter: <K extends keyof JobFilterState>(key: K, value: JobFilterState[K]) => void;
  resetFilters: () => void;
} {
  const searchParams = useSearchParams();

  const getInitialFilters = useCallback((): JobFilterState => {
    // SSR and initial render: always return default (empty) state
    // to keep SSR and client first render consistent
    return {
      keyword: '',
      trackId: '',
      city: '',
      urgentOnly: false,
    };
  }, []);

  const [filters, setFilters] = useState<JobFilterState>(getInitialFilters);

  // Hydrate from URL params on client side only
  useEffect(() => {
    const urlTrack = searchParams.get('track');
    const urlKeyword = searchParams.get('keyword');
    const urlCity = searchParams.get('city');
    const urlUrgent = searchParams.get('urgent');

    if (urlTrack || urlKeyword || urlCity || urlUrgent) {
      setFilters({
        keyword: urlKeyword ?? '',
        trackId: urlTrack ?? '',
        city: urlCity ?? '',
        urgentOnly: urlUrgent === 'true',
      });
      return;
    }

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as JobFilterState;
        setFilters({
          keyword: parsed.keyword ?? '',
          trackId: parsed.trackId ?? '',
          city: parsed.city ?? '',
          urgentOnly: parsed.urgentOnly ?? false,
        });
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof JobFilterState>(
    key: K,
    value: JobFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      keyword: '',
      trackId: '',
      city: '',
      urgentOnly: false,
    });
  }, []);

  return { filters, setFilters, updateFilter, resetFilters };
}
