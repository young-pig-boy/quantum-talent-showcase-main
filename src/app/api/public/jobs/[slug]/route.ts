import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { mapPublicationToPublicJob } from '@/lib/public-jobs/mapper';
import { resolvePublicJobFields } from '@/lib/public-jobs/en-columns';

/**
 * GET /api/public/jobs/[slug]
 * 公开岗位详情 — 按 slug 查询 Published JobPublication
 * 不 JOIN jobs/companies，仅读取 job_publications 脱敏字段
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServerClient();
    const fields = await resolvePublicJobFields(supabase);

    const { data, error } = await supabase
      .from('job_publications')
      .select(fields)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '岗位不存在或已下架' },
        { status: 404 }
      );
    }

    const pub = data as Record<string, unknown>;

    const job = mapPublicationToPublicJob(pub);

    return NextResponse.json({ job });
  } catch (err) {
    console.error('[GET /api/public/jobs/[slug]] Unexpected error:', err);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
