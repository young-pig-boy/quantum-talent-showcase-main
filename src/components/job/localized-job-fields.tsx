'use client';

/**
 * 岗位动态字段的双语渲染组件（Server Component 中使用）。
 * 英文模式优先取 _en 字段，未录入时回落中文。
 */

import { useLanguageMode } from '@/lib/language-mode';
import { localizedPublicJob, type LocalizedJobInput } from '@/lib/public-job';
import { localizedEducation, localizedExperience } from '@/lib/localized-helpers';

type LJob = LocalizedJobInput;

/** 学历/经验双语取值所需的最小字段集（含迁移 003 的英文列） */
type EduExpJob = {
  education?: string | null;
  educationEn?: string | null;
  experience?: string | null;
  experienceEn?: string | null;
};

export function LJobTitle({ job, className }: { job: LJob; className?: string }) {
  const { mode } = useLanguageMode();
  return <span className={className}>{localizedPublicJob(job, mode).title}</span>;
}

export function LJobDirection({
  job,
  withSeniority = false,
  className,
}: {
  job: LJob;
  withSeniority?: boolean;
  className?: string;
}) {
  const { mode } = useLanguageMode();
  const loc = localizedPublicJob(job, mode);
  const text = withSeniority && loc.seniority ? `${loc.direction} · ${loc.seniority}` : loc.direction;
  return <span className={className}>{text}</span>;
}

export function LJobSeniority({ job, className }: { job: LJob; className?: string }) {
  const { mode } = useLanguageMode();
  return <span className={className}>{localizedPublicJob(job, mode).seniority}</span>;
}

export function LJobSummary({ job, className }: { job: LJob; className?: string }) {
  const { mode } = useLanguageMode();
  return <span className={className}>{localizedPublicJob(job, mode).summary}</span>;
}

export function LJobEducation({ job, className }: { job: EduExpJob; className?: string }) {
  const { mode } = useLanguageMode();
  return <span className={className}>{localizedEducation(job, mode)}</span>;
}

export function LJobExperience({ job, className }: { job: EduExpJob; className?: string }) {
  const { mode } = useLanguageMode();
  return <span className={className}>{localizedExperience(job, mode)}</span>;
}
