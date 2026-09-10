'use client';

/**
 * 岗位编号（public_job_code）统一展示组件。
 *
 * 设计约定：
 * - 单行 nowrap，mono + tabular-nums，视觉弱于岗位名称（不抢标题、不放大 Badge）
 * - 数据异常（null / undefined / 空串）时静默隐藏，绝不向候选人展示假编号或 undefined
 * - 开发环境打印错误日志，便于定位历史脏数据；生产环境不打扰
 *
 * Showcase 只消费 Supabase job_publications.public_job_code，不参与编号生成。
 */

import { useLanguageMode } from '@/lib/language-mode';

interface JobCodeProps {
  code: string | null | undefined;
  /** 是否显示「岗位编号」前缀，默认显示 */
  showLabel?: boolean;
  /** 尺寸：sm = 卡片级（11px），md = 详情/抽屉级（13px） */
  size?: 'sm' | 'md';
  /** 追加外层 class */
  className?: string;
}

export function JobCode({ code, showLabel = true, size = 'sm', className = '' }: JobCodeProps) {
  const { mode } = useLanguageMode();
  const isEn = mode === 'en';

  if (!code || !code.trim()) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[JobCode] public_job_code 缺失（岗位编号为空），已隐藏编号展示。');
    }
    return null;
  }

  const sizeClass = size === 'md' ? 'text-[13px]' : 'text-[11px]';

  return (
    <span
      className={`inline-flex items-baseline gap-1.5 font-mono tracking-wide whitespace-nowrap tabular-nums ${sizeClass} ${className}`}
    >
      {showLabel && <span className="text-muted-foreground/45">{isEn ? 'Job ID' : '岗位编号'}</span>}
      <span className="text-muted-foreground/80">{code}</span>
    </span>
  );
}
