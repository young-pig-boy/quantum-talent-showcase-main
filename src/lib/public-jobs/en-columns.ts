/**
 * EN 字段可用性探测。
 *
 * job_publications 的 _en 列由迁移逐步引入：
 *   - 002_add_publication_english_fields.sql：public_title_en / summary_en / direction_en / seniority_en
 *   - 003_add_education_experience_english.sql：education_en / experience_en
 * 在迁移执行之前，select 里带不存在的列会让 PostgREST 整个查询报错（PGRST204）。
 * 这里在每个服务进程内做一次轻量探测（head 请求），按可用性返回最高可用的字段白名单，
 * 保证「先更新代码、后跑迁移」或「迁移回滚」都不会弄坏岗位列表。
 */

import {
  PUBLIC_JOB_FIELDS,
  PUBLIC_JOB_FIELDS_WITH_EN,
  PUBLIC_JOB_FIELDS_WITH_EN_V2,
  PUBLIC_JOB_FIELDS_WITH_EN_V3,
} from './mapper';

type SupabaseLike = {
  from(table: string): {
    select(columns: string, options?: Record<string, unknown>): {
      limit(count: number): PromiseLike<{ error: { code?: string; message?: string } | null }>;
    };
  };
};

let fieldsCache: string | null = null;
let cachedAt = 0;

/** 低于最高档的缓存保留时长（ms）：迁移刚执行完，等这么久就会自动升级字段白名单，无需重启 */
const DOWNGRADED_CACHE_TTL_MS = 60_000;

async function probe(client: SupabaseLike, columns: string): Promise<boolean> {
  try {
    const { error } = await client
      .from('job_publications')
      .select(columns, { head: true, count: 'exact' })
      .limit(0);
    if (error) {
      console.log(`[public-jobs] EN columns [${columns}] not available yet:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`[public-jobs] EN columns probe [${columns}] failed:`, err);
    return false;
  }
}

export async function resolvePublicJobFields(client: SupabaseLike): Promise<string> {
  // 满配缓存永久有效；降级缓存带 TTL —— 迁移执行后自动重新探测升级，避免"迁移前启动的进程永远拿不到新列"
  const isFull = fieldsCache === PUBLIC_JOB_FIELDS_WITH_EN;
  if (fieldsCache !== null && (isFull || Date.now() - cachedAt < DOWNGRADED_CACHE_TTL_MS)) {
    return fieldsCache;
  }
  if (await probe(client, PUBLIC_JOB_EN_FIELDS_FULL_PROBE)) {
    fieldsCache = PUBLIC_JOB_FIELDS_WITH_EN;
  } else if (await probe(client, PUBLIC_JOB_EN_FIELDS_V2_PROBE)) {
    fieldsCache = PUBLIC_JOB_FIELDS_WITH_EN_V2;
  } else if (await probe(client, PUBLIC_JOB_EN_FIELDS_V3_PROBE)) {
    fieldsCache = PUBLIC_JOB_FIELDS_WITH_EN_V3;
  } else {
    fieldsCache = PUBLIC_JOB_FIELDS;
  }
  cachedAt = Date.now();
  return fieldsCache;
}

// 探针用的列清单（与 mapper 白名单保持一致，单独命名避免循环依赖困惑）
const PUBLIC_JOB_EN_FIELDS_FULL_PROBE =
  'public_title_en,summary_en,direction_en,seniority_en,education_en,experience_en,responsibilities_en,requirements_en';
const PUBLIC_JOB_EN_FIELDS_V2_PROBE =
  'public_title_en,summary_en,direction_en,seniority_en,education_en,experience_en';
const PUBLIC_JOB_EN_FIELDS_V3_PROBE = 'public_title_en,summary_en,direction_en,seniority_en';
