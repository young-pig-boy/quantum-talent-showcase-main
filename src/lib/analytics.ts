'use client';

import { trackApiEvent } from './analytics-api';

export type AnalyticsEvent =
  | 'page_view'
  | 'track_click'
  | 'job_view'
  | 'job_impression'
  | 'share'
  | 'contact_click'
  | 'apply_start'
  | 'apply_submit'
  | 'email_copy'
  | 'wechat_consult';

let sessionId = '';
let referrer = '';

if (typeof window !== 'undefined') {
  sessionId = sessionStorage.getItem('analytics_session_id') || '';
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  referrer = document.referrer || '';
}

export function trackEvent(
  event: AnalyticsEvent,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;

  const publicationId = (payload.publication_id as string) || (payload.job_id as string) || undefined;

  // Fire and forget - don't block the main thread
  trackApiEvent(event, {
    publication_id: publicationId,
    referrer,
    metadata: {
      url: typeof window !== 'undefined' ? window.location.href : '',
      ...payload,
    },
  }).catch(() => {
    // silently ignore analytics errors
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, payload);
  }
}
