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

/**
 * 详情页"同赛道岗位"列表项：完整 PublicJob（含 *_en 英文字段），供双语渲染。
 * 查询走 resolvePublicJobFields 白名单，与详情页主岗位同构。
 */
export type RelatedJobItem = PublicJob;

/**
 * slug 归一化：Next 动态路由参数会把非 ASCII 字符以 percent-encoding 原样传入
 * （例如 `量子…` → `%E9%87%8F…`），而库里存的是解码后的字面量。
 * 因此查询前先尝试解码，并同时保留原始值作为候选，两种调用路径都能命中。
 */
export function slugCandidates(raw: string): string[] {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // 含非法转义序列（如字面量 %）时保留原值
    decoded = raw;
  }
  return Array.from(new Set([decoded, raw].filter((s) => s.length > 0)));
}

/**
 * 按 slug 读取一个已发布岗位。
 * - 不存在 / 已下架 → 返回 null（由调用方 notFound()）
 * - 数据库真实异常 → 记录服务端日志并抛出（由 error.tsx 接管）
 */
export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  const supabase = createServerClient();
  const fields = await resolvePublicJobFields(supabase);
  const candidates = slugCandidates(slug);
  if (candidates.length === 0) return null;

  const { data, error } = await supabase
    .from('job_publications')
    .select(fields)
    .eq('status', 'published')
    .in('slug', candidates)
    .maybeSingle();

  if (error) {
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

  return (data || []).map((pub) => mapPublicationToPublicJob(pub as Record<string, unknown>));
}
