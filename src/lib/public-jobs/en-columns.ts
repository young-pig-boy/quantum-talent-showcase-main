/**
 * EN 字段可用性探测。
 *
 * job_publications 的 _en 列由迁移 002_add_publication_english_fields.sql 引入。
 * 在迁移执行之前，select 里带 _en 列会让 PostgREST 整个查询报错（PGRST204）。
 * 这里在每个服务进程内做一次轻量探测（head 请求），按可用性返回字段白名单，
 * 保证「先更新代码、后跑迁移」或「迁移回滚」都不会弄坏岗位列表。
 */

import { PUBLIC_JOB_FIELDS, PUBLIC_JOB_FIELDS_WITH_EN } from './mapper';

type SupabaseLike = {
  from(table: string): {
    select(columns: string, options?: Record<string, unknown>): {
      limit(count: number): PromiseLike<{ error: { code?: string; message?: string } | null }>;
    };
  };
};

let enColumnsAvailable: boolean | null = null;

export async function resolvePublicJobFields(client: SupabaseLike): Promise<string> {
  if (enColumnsAvailable !== null) {
    return enColumnsAvailable ? PUBLIC_JOB_FIELDS_WITH_EN : PUBLIC_JOB_FIELDS;
  }
  try {
    const { error } = await client
      .from('job_publications')
      .select('public_title_en', { head: true, count: 'exact' })
      .limit(0);
    enColumnsAvailable = !error;
    if (error) {
      console.log('[public-jobs] EN columns not available yet, falling back to zh-only fields:', error.message);
    }
  } catch (err) {
    enColumnsAvailable = false;
    console.log('[public-jobs] EN columns probe failed, falling back to zh-only fields:', err);
  }
  return enColumnsAvailable ? PUBLIC_JOB_FIELDS_WITH_EN : PUBLIC_JOB_FIELDS;
}
