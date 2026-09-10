import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { normalizePublicLocation } from '@/lib/public-location';

/**
 * GET /api/public/jobs/filter-options
 * 公开筛选选项 — 返回已发布岗位的唯一赛道与城市列表
 *
 * 安全设计：
 *   - 仅读取 job_publications status=published 的 track 与 city 字段
 *   - 绝不返回 company / public_company_name / company_name 等字段
 *   - 需要 Supabase 侧配置 anon SELECT RLS 策略后生效
 */
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('job_publications')
      .select('track, city')
      .eq('status', 'published');

    if (error) {
      console.error('[GET /api/public/jobs/filter-options] Supabase error:', error);
      return NextResponse.json(
        { error: '查询筛选选项失败' },
        { status: 500 }
      );
    }

    const rows = data as Array<{ track: string | null; city: string | null }>;

    // Extract unique tracks and cities (with defensive normalization)
    const trackSet = new Set<string>();
    const citySet = new Set<string>();
    rows.forEach((row) => {
      if (row.track) trackSet.add(row.track);
      const normalizedCity = normalizePublicLocation(row.city);
      if (normalizedCity) citySet.add(normalizedCity);
    });

    return NextResponse.json({
      tracks: Array.from(trackSet).sort(),
      cities: Array.from(citySet).sort(),
    });
  } catch (err) {
    console.error('[GET /api/public/jobs/filter-options] Unexpected error:', err);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
