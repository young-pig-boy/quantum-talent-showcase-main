import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PUBLIC_JOB_FIELDS, mapPublicationToPublicJob } from '@/lib/public-jobs/mapper';

/**
 * GET /api/public/jobs
 * 公开岗位列表 — 仅读取 job_publications 脱敏字段
 *
 * Query params:
 *   - search: 关键词搜索
 *   - track:  赛道过滤
 *   - city:   城市过滤
 *   - limit:  每页数量（默认 20，最大 100）
 *   - offset: 偏移量（默认 0）
 *
 * 安全设计：
 *   - 不 JOIN jobs / companies 表，避免 RLS 关联表权限阻断
 *   - 仅返回 job_publications 中已发布的公开字段
 *   - 需要 Supabase 侧配置 anon SELECT RLS 策略后生效
 *   - 详见 docs/SUPABASE_REQUIRED_CHANGES.md
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const track = searchParams.get('track') || '';
    const city = searchParams.get('city') || '';
    const featured = searchParams.get('featured');
    const urgent = searchParams.get('urgent');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = createServerClient();

    // Only published publications — no JOINs to jobs/companies
    // Explicit field whitelist — public_company_name excluded from public API
    let query = supabase
      .from('job_publications')
      .select(PUBLIC_JOB_FIELDS, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (featured === 'true') {
      query = query.eq('featured', true);
    } else if (featured === 'false') {
      query = query.eq('featured', false);
    }

    if (urgent === 'true') {
      // Urgent: must be urgent=true AND (expires_at IS NULL OR expires_at > now)
      const now = new Date().toISOString();
      query = query
        .eq('urgent', true)
        .or(`urgent_expires_at.is.null,urgent_expires_at.gt.${now}`);
    }

    if (track) {
      query = query.eq('track', track);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (search) {
      query = query.or(
        `public_title.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[GET /api/public/jobs] Supabase error:', error);
      return NextResponse.json(
        { error: '查询岗位列表失败' },
        { status: 500 }
      );
    }

    const jobs = (data || []).map((pub: Record<string, unknown>) =>
      mapPublicationToPublicJob(pub)
    );

    return NextResponse.json({ jobs, total: count || 0 });
  } catch (err) {
    console.error('[GET /api/public/jobs] Unexpected error:', err);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
