'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

interface JobViewTrackerProps {
  jobId: string;
}

export function JobViewTracker({ jobId }: JobViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !jobId) return;
    tracked.current = true;

    trackEvent('job_view', {
      job_id: jobId,
      publication_id: jobId,
    });
  }, [jobId]);

  return null;
}
