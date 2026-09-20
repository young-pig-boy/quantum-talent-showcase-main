/**
 * Public Job 服务端数据读取层（Server Component 直接使用）。
 *
 * 与 API Route 复用同一套字段映射逻辑（mapper.ts），
 * 直接查询 Supabase job_publications，不经过 localhost self-fetch。
 *
 * 安全规则与 Public API 保持一致：
 *   - 仅读取 status = 'published'
 *   - 仅读取 PUBLIC_JOB_FIELDS 白名单字段
 *   - 不 JOIN jobs / companies，不返回客户真实公司信息
 */

import { createServerClient } from '@/lib/supabase/server';
import { mapPublicationToPublicJob } from './mapper';
import { resolvePublicJobFields } from './en-columns';
import type { PublicJob } from '@/lib/public-job';

export interface RelatedJobItem {
  id: string;
  slug: string;
  public_job_code: string | null;
  title: string;
  city: string;
}

/**
 * 按 slug 读取一个已发布岗位。
 * - 不存在 / 已下架 → 返回 null（由调用方 notFound()）
 * - 数据库真实异常 → 记录服务端日志并抛出（由 error.tsx 接管）
 */
export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  const supabase = createServerClient();
  const fields = await resolvePublicJobFields(supabase);

  const { data, error } = await supabase
    .from('job_publications')
    .select(fields)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    // PGRST116 = 查询结果为 0 行，等价于岗位不存在，属正常业务分支
    if (error.code === 'PGRST116') return null;
    console.error('[getPublicJobBySlug] Supabase error:', error);
    throw new Error('岗位数据加载失败，请稍后重试');
  }

  if (!data) return null;
  return mapPublicationToPublicJob(data as Record<string, unknown>);
}

/**
 * 读取同赛道相关岗位（排除当前岗位）。
 * - track 为空 → 返回 []
 * - 查询异常 → 记录日志并返回 []（不影响详情页主流程）
 */
export async function getRelatedJobs(
  track: string,
  excludeSlug: string
): Promise<RelatedJobItem[]> {
  if (!track) return [];

  const supabase = createServerClient();
  const fields = await resolvePublicJobFields(supabase);

  const { data, error } = await supabase
    .from('job_publications')
    .select(fields)
    .eq('status', 'published')
    .eq('track', track)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('[getRelatedJobs] Supabase error:', error);
    return [];
  }

  return (data || []).map((pub) => {
    const job = mapPublicationToPublicJob(pub as Record<string, unknown>);
    return {
      id: job.id,
      slug: job.slug,
      public_job_code: job.public_job_code,
      title: job.title,
      city: job.city,
    };
  });
}
