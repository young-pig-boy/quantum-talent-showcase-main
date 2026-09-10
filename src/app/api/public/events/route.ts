import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/** UUID v4 format regex */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Allowed event types — must match the whitelist in public_track_event RPC.
 * Any event type not in this list is rejected before reaching the database.
 */
const ALLOWED_EVENT_TYPES = new Set([
  'page_view',
  'track_click',
  'job_impression',
  'job_view',
  'share',
  'contact_click',
  'apply_start',
  'apply_submit',
  'email_copy',
  'wechat_consult',
]);

/** Maximum field lengths */
const LIMITS = {
  session_id: 200,
  referrer: 1000,
  metadata_bytes: 10240,
} as const;

/**
 * POST /api/public/events
 * 行为埋点 — 通过受控 RPC 写入 analytics_events
 *
 * 安全架构：
 *   浏览器 → POST /api/public/events → Supabase RPC (public_track_event) → analytics_events
 *   浏览器不直接 INSERT analytics_events 表。
 *
 * 设计原则：
 *   - 埋点失败不阻塞候选人主流程
 *   - 不记录完整手机号、邮箱
 *   - 不输出 Publishable Key
 *   - 不暴露数据库错误堆栈
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, publication_id, session_id, referrer, metadata } = body as Record<string, unknown>;

    // ── 1. event_type 校验（必须在白名单内） ──
    if (!event_type || typeof event_type !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'EVENT_TYPE_REQUIRED', message: 'event_type 不能为空' } },
        { status: 400 }
      );
    }

    if (!ALLOWED_EVENT_TYPES.has(event_type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_EVENT_TYPE', message: `不支持的事件类型: ${event_type}` } },
        { status: 400 }
      );
    }

    // ── 2. publication_id 校验（可为空，但提供时必须为有效 UUID） ──
    let safePublicationId: string | null = null;
    if (publication_id !== undefined && publication_id !== null) {
      if (typeof publication_id !== 'string') {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PUBLICATION_ID', message: 'publication_id 格式无效' } },
          { status: 400 }
        );
      }
      if (publication_id !== '' && !UUID_RE.test(publication_id)) {
        // Invalid UUID format — reject before reaching RPC to avoid 22P02
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PUBLICATION_ID', message: 'publication_id 不是有效的 UUID' } },
          { status: 400 }
        );
      }
      safePublicationId = publication_id !== '' ? publication_id : null;
    }

    // ── 3. 字段长度校验 ──
    const safeSessionId = typeof session_id === 'string'
      ? session_id.slice(0, LIMITS.session_id)
      : null;

    const safeReferrer = typeof referrer === 'string'
      ? referrer.slice(0, LIMITS.referrer)
      : null;

    // metadata 大小限制（数据库字段非空，空值统一为 {}）
    let safeMetadata: Record<string, unknown> = {};
    if (metadata !== undefined && metadata !== null) {
      if (typeof metadata !== 'object' || Array.isArray(metadata)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_METADATA', message: 'metadata 必须为对象' } },
          { status: 400 }
        );
      }
      const metadataStr = JSON.stringify(metadata);
      if (metadataStr.length > LIMITS.metadata_bytes) {
        return NextResponse.json(
          { success: false, error: { code: 'METADATA_TOO_LARGE', message: 'metadata 数据过大' } },
          { status: 400 }
        );
      }
      // Strip sensitive fields from metadata
      safeMetadata = { ...(metadata as Record<string, unknown>) };
      delete safeMetadata.phone;
      delete safeMetadata.email;
      delete safeMetadata.full_name;
      delete safeMetadata.apikey;
      delete safeMetadata.token;
    }

    // ── 4. 调用受控 RPC ──
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('public_track_event', {
      p_event_type: event_type,
      p_publication_id: safePublicationId,
      p_session_id: safeSessionId,
      p_referrer: safeReferrer,
      p_metadata: safeMetadata,
    });

    if (error) {
      const msg = error.message || '';
      const code = error.code || '';

      // RPC function not found — migration not yet executed
      if (code === 'PGRST202' || code === '42883') {
        console.error('[POST /api/public/events] RPC not found. Migration not executed yet.');
        // Don't block main flow — return success even if RPC is unavailable
        return NextResponse.json({ success: true, message: 'ok (rpc unavailable)' });
      }

      // Log error but don't expose details to client
      console.error('[POST /api/public/events] RPC error:', { code, message: msg });
      // Still return success to not block main flow
      return NextResponse.json({ success: true, message: 'ok (error logged)' });
    }

    return NextResponse.json({ success: true, message: 'ok' });
  } catch (err) {
    // Analytics failure must never block the main user flow
    console.error('[POST /api/public/events] Unexpected error:', err);
    return NextResponse.json({ success: true, message: 'ok (error caught)' });
  }
}
