'use client';

/**
 * 前端埋点 — 通过 API 写入 analytics_events
 * 失败不阻塞主流程
 */
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return sessionId;
}

export async function trackApiEvent(
  event_type: string,
  options?: {
    publication_id?: string;
    referrer?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await fetch('/api/public/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        publication_id: options?.publication_id || null,
        session_id: getSessionId(),
        referrer: options?.referrer || document.referrer || null,
        metadata: options?.metadata || null,
        occurred_at: new Date().toISOString(),
      }),
    });
  } catch {
    // 埋点失败不阻塞主流程
  }
}
