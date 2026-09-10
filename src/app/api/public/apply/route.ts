import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/** UUID v4 format regex */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Maximum field lengths (must match RPC validation) */
const LIMITS = {
  full_name: 100,
  phone: 30,
  email: 200,
  notes: 2000,
  resume_url: 1000,
  source: 100,
} as const;

/**
 * POST /api/public/apply
 * 候选人投递 — 通过受控 RPC 创建 Lead（状态强制为 'new'）
 *
 * 安全架构：
 *   浏览器 → POST /api/public/apply → Supabase RPC (public_submit_application) → leads
 *   浏览器不直接 INSERT leads 表。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── 1. 请求体解析与 Zod 式校验 ──
    const {
      full_name,
      name,
      phone,
      email,
      publication_id,
      notes,
      resume_url,
      source,
    } = body as Record<string, unknown>;

    const resolvedName = typeof full_name === 'string'
      ? full_name
      : typeof name === 'string'
        ? name
        : '';

    const errors: string[] = [];

    if (!resolvedName || resolvedName.trim().length === 0) {
      errors.push('姓名不能为空');
    } else if (resolvedName.trim().length > LIMITS.full_name) {
      errors.push(`姓名不能超过${LIMITS.full_name}个字符`);
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      errors.push('手机号格式不正确');
    } else if (typeof phone === 'string' && phone.trim().length > LIMITS.phone) {
      errors.push(`手机号不能超过${LIMITS.phone}个字符`);
    }

    if (email !== undefined && email !== null && typeof email !== 'string') {
      errors.push('邮箱格式不正确');
    } else if (typeof email === 'string' && email.length > LIMITS.email) {
      errors.push(`邮箱不能超过${LIMITS.email}个字符`);
    }

    if (!publication_id || typeof publication_id !== 'string') {
      errors.push('岗位信息缺失');
    } else if (!UUID_RE.test(publication_id)) {
      errors.push('岗位信息格式无效');
    }

    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      errors.push('备注格式不正确');
    } else if (typeof notes === 'string' && notes.length > LIMITS.notes) {
      errors.push(`备注不能超过${LIMITS.notes}个字符`);
    }

    if (resume_url !== undefined && resume_url !== null && typeof resume_url !== 'string') {
      errors.push('简历链接格式不正确');
    }

    // phone 与 email 至少有一个有效值
    const hasPhone = typeof phone === 'string' && phone.trim().length > 0;
    const hasEmail = typeof email === 'string' && email.trim().length > 0 && email.includes('@');
    if (!hasPhone && !hasEmail) {
      errors.push('手机号和邮箱至少填写一项');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: errors[0] } },
        { status: 400 }
      );
    }

    // ── 2. 调用受控 RPC ──
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('public_submit_application', {
      p_publication_id: publication_id,
      p_full_name: resolvedName.trim(),
      p_phone: hasPhone ? (phone as string).trim() : null,
      p_email: hasEmail ? (email as string).trim() : null,
      p_source: typeof source === 'string' && source.trim().length > 0
        ? source.trim()
        : 'website',
      p_notes: typeof notes === 'string' && notes.trim().length > 0 ? notes.trim() : null,
      p_resume_url: typeof resume_url === 'string' && resume_url.trim().length > 0
        ? resume_url.trim()
        : null,
    });

    if (error) {
      // Map known RPC exception codes to safe client messages
      const msg = error.message || '';
      const code = error.code || '';

      // RPC RAISE EXCEPTION codes
      if (msg.includes('PUBLICATION_NOT_FOUND') || msg.includes('该岗位不存在')) {
        return NextResponse.json(
          { success: false, error: { code: 'PUBLICATION_NOT_FOUND', message: '该岗位不存在' } },
          { status: 400 }
        );
      }
      if (msg.includes('PUBLICATION_NOT_AVAILABLE') || msg.includes('该岗位已关闭')) {
        return NextResponse.json(
          { success: false, error: { code: 'PUBLICATION_NOT_AVAILABLE', message: '该岗位已关闭或不可投递' } },
          { status: 400 }
        );
      }
      if (msg.includes('NAME_REQUIRED')) {
        return NextResponse.json(
          { success: false, error: { code: 'NAME_REQUIRED', message: '姓名不能为空' } },
          { status: 400 }
        );
      }
      if (msg.includes('CONTACT_REQUIRED')) {
        return NextResponse.json(
          { success: false, error: { code: 'CONTACT_REQUIRED', message: '手机号和邮箱至少填写一项' } },
          { status: 400 }
        );
      }

      // RPC function not found — migration not yet executed
      if (code === 'PGRST202' || code === '42883') {
        console.error('[POST /api/public/apply] RPC not found. Migration not executed yet.');
        return NextResponse.json(
          { success: false, error: { code: 'SERVICE_UNAVAILABLE', message: '投递服务暂时不可用，请稍后重试' } },
          { status: 503 }
        );
      }

      // Generic database error — do NOT expose raw PostgreSQL error to client
      console.error('[POST /api/public/apply] RPC error:', { code, message: msg });
      return NextResponse.json(
        { success: false, error: { code: 'SUBMIT_FAILED', message: '投递失败，请稍后重试' } },
        { status: 500 }
      );
    }

    // ── 3. 解析 RPC 返回值 ──
    const result = data as Record<string, unknown> | null;

    if (result && result.success === false) {
      // Business-level rejection (e.g. duplicate submission)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: (result.code as string) || 'SUBMIT_REJECTED',
            message: (result.message as string) || '提交被拒绝',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lead_id: result?.lead_id as string,
        message: (result?.message as string) || '投递成功！我们会尽快与您联系。',
      },
    });
  } catch (err) {
    console.error('[POST /api/public/apply] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
