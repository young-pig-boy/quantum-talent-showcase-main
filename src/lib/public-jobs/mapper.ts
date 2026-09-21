/**
 * Public Job 共享字段映射逻辑。
 *
 * 供 Supabase → 公开数据这一层复用，避免 API Route 与 Server Component
 * 各自维护一套字段转换逻辑，导致字段演进时产生漂移。
 *
 * 此文件为纯模块，不引入 Supabase Client，不依赖浏览器 / 服务端专属 API。
 */

import type { PublicJob } from '@/lib/public-job';
import { normalizePublicLocation } from '@/lib/public-location';

/**
 * 公开岗位字段白名单。
 * 仅读取 job_publications 中的公开字段，绝不包含 public_company_name 等客户真实公司信息。
 */
export const PUBLIC_JOB_FIELDS =
  'id,slug,public_job_code,public_title,city,salary_display,responsibilities,requirements,education,experience,track,status,published_at,summary,direction,seniority,tags,urgent,urgent_started_at,urgent_expires_at,featured';

/** 英文动态字段（迁移 004 全量：标题/摘要/方向/职级/学历/经验/职责/要求，需通过 probe 降级，见 en-columns.ts） */
export const PUBLIC_JOB_EN_FIELDS =
  'public_title_en,summary_en,direction_en,seniority_en,education_en,experience_en,responsibilities_en,requirements_en';

/** 迁移 003 的英文列（004 未执行时降级使用） */
export const PUBLIC_JOB_EN_FIELDS_V2 =
  'public_title_en,summary_en,direction_en,seniority_en,education_en,experience_en';

/** 迁移 002 的英文列（003 未执行时降级使用） */
export const PUBLIC_JOB_EN_FIELDS_V3 =
  'public_title_en,summary_en,direction_en,seniority_en';

export const PUBLIC_JOB_FIELDS_WITH_EN = `${PUBLIC_JOB_FIELDS},${PUBLIC_JOB_EN_FIELDS}`;

export const PUBLIC_JOB_FIELDS_WITH_EN_V2 = `${PUBLIC_JOB_FIELDS},${PUBLIC_JOB_EN_FIELDS_V2}`;

/** 迁移 002 的英文列（003 未执行时降级使用） */
export const PUBLIC_JOB_FIELDS_WITH_EN_V3 = `${PUBLIC_JOB_FIELDS},${PUBLIC_JOB_EN_FIELDS_V3}`;

/**
 * 将 Supabase 返回的 job_publications 行映射为 PublicJob。
 * 兼容降级：行中若不含 _en 字段（迁移未执行），一律映射为空串 → 前台英文模式回落中文。
 */
export function mapPublicationToPublicJob(pub: Record<string, unknown>): PublicJob {
  return {
    id: pub.id as string,
    slug: (pub.slug as string) || '',
    public_job_code: (pub.public_job_code as string) || null,
    title: (pub.public_title as string) || '',
    titleEn: (pub.public_title_en as string) || '',
    track: (pub.track as string) || '',
    city: normalizePublicLocation((pub.city as string) || ''),
    education: (pub.education as string) || '',
    educationEn: (pub.education_en as string) || '',
    experience: (pub.experience as string) || '',
    experienceEn: (pub.experience_en as string) || '',
    requirements: parseStringArray(pub.requirements),
    requirementsEn: parseStringArray(pub.requirements_en),
    responsibilities: parseStringArray(pub.responsibilities),
    responsibilitiesEn: parseStringArray(pub.responsibilities_en),
    salary_display: (pub.salary_display as string) || '',
    summary: (pub.summary as string) || '',
    summaryEn: (pub.summary_en as string) || '',
    direction: (pub.direction as string) || '',
    directionEn: (pub.direction_en as string) || '',
    seniority: (pub.seniority as string) || '',
    seniorityEn: (pub.seniority_en as string) || '',
    tags: parseTagsArray(pub.tags),
    urgent: (pub.urgent as boolean) || false,
    urgent_started_at: (pub.urgent_started_at as string) || null,
    urgent_expires_at: (pub.urgent_expires_at as string) || null,
    featured: (pub.featured as boolean) || false,
    published_at: (pub.published_at as string) || '',
    status: (pub.status as string) || '',
  };
}

export function parseStringArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return val.replace(/[{}"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function parseTagsArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}
