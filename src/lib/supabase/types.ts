/**
 * API 响应类型 — 展示网站 Public API
 */

/** 岗位列表项（仅读取 job_publications 脱敏字段，不 JOIN jobs/companies） */
export interface PublicJob {
  id: string;           // publication id
  slug: string;
  title: string;        // from job_publications.public_title
  track: string;        // from job_publications.track
  city: string;
  education: string;
  experience: string;
  requirements: string[];
  responsibilities: string[];
  salary_display: string;
  summary: string;      // 岗位简介
  direction: string;    // 具体技术方向
  seniority: string;    // 职级
  tags: string[];
  urgent: boolean;
  published_at: string;
  status: string;
}

/** 岗位列表 API 响应 */
export interface PublicJobsResponse {
  jobs: PublicJob[];
  total: number;
}

/** 投递请求 */
export interface ApplyRequest {
  full_name: string;
  phone: string;
  email: string;
  publication_id: string;
  notes?: string;
  resume_url?: string;
}

/** 投递响应 */
export interface ApplyResponse {
  success: boolean;
  data?: {
    lead_id?: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

/** 事件请求 */
export interface EventRequest {
  event_type: string;
  publication_id?: string;
  session_id?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
  occurred_at?: string;
}

/** 事件响应 */
export interface EventResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}
