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

/**
 * LJobBulletList — 岗位职责/任职要求的编号列表（英文优先，空则回落中文）。
 * 渲染结构与岗位详情页原有列表保持一致（01/02… 编号 + 正文）。
 */
export function LJobBulletList({
  items,
  itemsEn,
  className = 'space-y-4',
}: {
  items: string[];
  itemsEn?: string[];
  className?: string;
}) {
  const { mode } = useLanguageMode();
  const list = mode === 'en' && itemsEn && itemsEn.length > 0 ? itemsEn : items;
  return (
    <ul className={className}>
      {list.map((item, index) => (
        <li key={index} className="flex gap-4">
          <span className="mt-1 font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="leading-[1.7] text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}
