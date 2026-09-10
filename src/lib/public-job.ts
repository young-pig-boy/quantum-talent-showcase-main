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
  track: string;
  city: string;
  education: string;
  experience: string;
  requirements: string[];
  responsibilities: string[];
  salary_display: string;
  published_at: string;
  status: string;
  summary: string;
  direction: string;
  seniority: string;
  tags: string[];
  urgent: boolean;
  urgent_started_at: string | null;
  urgent_expires_at: string | null;
  featured: boolean;
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
