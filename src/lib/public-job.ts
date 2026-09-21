/**
 * Public Job 共享纯类型与纯业务 helper。
 *
 * 重要：此文件是 Server / Client 共享的纯模块，**禁止**添加 'use client' 或 'use server'，
 * 也不得引入任何浏览器或服务端专属依赖（如 @supabase/supabase-js）。
 * 只放类型定义与无副作用纯函数，供 Server Component、API Route、Client Hook 共用。
 */

export interface PublicJob {
  id: string;
  slug: string;
  /** 岗位业务编号（QJ-26-XXXX），直接来自 job_publications.public_job_code，Showcase 只读不生成 */
  public_job_code: string | null;
  title: string;
  /** 英文标题（Console 录入；为空时英文模式回落中文） */
  titleEn: string;
  track: string;
  city: string;
  education: string;
  /** 学历要求英文（Console 录入；为空时英文模式回落映射表 → 中文） */
  educationEn: string;
  experience: string;
  /** 经验要求英文（Console 录入；为空时英文模式回落映射表 → 中文） */
  experienceEn: string;
  requirements: string[];
  requirementsEn: string[];
  responsibilities: string[];
  responsibilitiesEn: string[];
  salary_display: string;
  published_at: string;
  status: string;
  summary: string;
  summaryEn: string;
  direction: string;
  directionEn: string;
  seniority: string;
  seniorityEn: string;
  tags: string[];
  tagsEn: string[];
  urgent: boolean;
  urgent_started_at: string | null;
  urgent_expires_at: string | null;
  featured: boolean;
}

/** 动态展示字段（中/英取值结果） */
export interface LocalizedJobFields {
  title: string;
  direction: string;
  seniority: string;
  summary: string;
}

/** localizedPublicJob 允许只传动态展示字段（Server→Client 传参时类型更宽松） */
export type LocalizedJobInput = Partial<
  Pick<
    PublicJob,
    'title' | 'titleEn' | 'direction' | 'directionEn' | 'seniority' | 'seniorityEn' | 'summary' | 'summaryEn'
  >
> & { title: string };

/**
 * 按语言模式取岗位动态展示字段。
 * 约定：英文模式优先取 _en 字段，未录入（空）时回落中文原值，绝不留空。
 */
export function localizedPublicJob(
  job: LocalizedJobInput,
  mode: 'zh' | 'en'
): LocalizedJobFields {
  if (mode !== 'en') {
    return {
      title: job.title,
      direction: job.direction ?? '',
      seniority: job.seniority ?? '',
      summary: job.summary ?? '',
    };
  }
  return {
    title: job.titleEn || job.title,
    direction: job.directionEn || job.direction || '',
    seniority: job.seniorityEn || job.seniority || '',
    summary: job.summaryEn || job.summary || '',
  };
}

/**
 * Unified helper to determine if a job's urgent status is currently active.
 * A job is "actively urgent" only when:
 *   - urgent === true
 *   - AND (urgent_expires_at is null OR urgent_expires_at > now)
 *
 * This prevents expired urgent flags from showing in the UI.
 */
export function isUrgentActive(
  job: Pick<PublicJob, 'urgent' | 'urgent_expires_at'>
): boolean {
  if (!job.urgent) return false;
  if (!job.urgent_expires_at) return true;
  return new Date(job.urgent_expires_at) > new Date();
}
