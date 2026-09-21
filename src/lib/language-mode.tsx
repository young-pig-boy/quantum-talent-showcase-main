'use client';

/**
 * LanguageMode — 极薄的语言模式层。
 *
 * 只负责一件事：当前是不是 English Mode。
 * 不引入 i18n 框架、不持久化（避免 hydration mismatch / 中文先闪现）、
 * 不驱动任何业务数据（岗位数据永远是原始中文）。
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { localizeCity, localizeDisplayValue } from '@/lib/localized-helpers';

export type LanguageMode = 'zh' | 'en';

interface LanguageModeContextValue {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
  toggleMode: () => void;
}

const LanguageModeContext = createContext<LanguageModeContextValue>({
  mode: 'zh',
  setMode: () => {},
  toggleMode: () => {},
});

export function LanguageModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LanguageMode>('zh');

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  return (
    <LanguageModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </LanguageModeContext.Provider>
  );
}

export function useLanguageMode(): LanguageModeContextValue {
  return useContext(LanguageModeContext);
}

interface ETextProps {
  /** 中文文案（默认展示，与当前生产版本一致） */
  zh: string;
  /** English Mode 时展示的固定 UI 文案 */
  en: string;
  /** 附加 className（中文模式不产生任何额外样式） */
  className?: string;
  /**
   * 是否为较大的英文 Display Heading：
   * 仅 EN 模式下追加 font-serif，给英文标题一点 editorial 气质；
   * 中文模式完全不受影响。
   */
  display?: boolean;
}

/**
 * EText — 轻量双语固定文案组件。
 * 仅用于“固定 UI 文案”，禁止用于岗位等动态业务内容。
 * 自身是小型 Client Component，可安全嵌入 Server Page，无需把父页面 Client 化。
 */
export function EText({ zh, en, className, display = false }: ETextProps) {
  const { mode } = useLanguageMode();
  if (mode !== 'en') {
    return <span className={className}>{zh}</span>;
  }
  return <span className={display ? `${className ?? ''} font-serif whitespace-normal`.trim() : className}>{en}</span>;
}

interface EnOnlyProps {
  children: ReactNode;
  className?: string;
}

/**
 * EnOnly — 仅 English Mode 渲染其内容（中文模式完全不渲染）。
 * 用于 E Mode 特有的轻量提示（例如 Job Detail 的中文正文提示）。
 */
export function EnOnly({ children, className }: EnOnlyProps) {
  const { mode } = useLanguageMode();
  if (mode !== 'en') return null;
  return <span className={className}>{children}</span>;
}

interface ZhOnlyProps {
  children: ReactNode;
  className?: string;
}

/**
 * ZhOnly — 仅中文模式渲染其内容（English Mode 完全不渲染）。
 * 用于中文模式下特有的装饰性英文小字等元素。
 */
export function ZhOnly({ children, className }: ZhOnlyProps) {
  const { mode } = useLanguageMode();
  if (mode !== 'zh') return null;
  if (className) return <span className={className}>{children}</span>;
  return <>{children}</>;
}

/* ──────────────────────────────────────────────
 * ECity — localize a city string for E Mode.
 * Falls back to original value if no mapping exists.
 * ────────────────────────────────────────────── */
interface ECityProps {
  city: string;
  className?: string;
}

export function ECity({ city, className }: ECityProps) {
  const { mode } = useLanguageMode();
  // 委托给 localized-helpers 的统一解析链：城市映射未命中时
  // 会继续尝试状态值映射（如城市字段被填成"待确认"→ To be confirmed）。
  // localized-helpers 对本模块仅类型导入，无运行时循环依赖。
  return <span className={className}>{localizeCity(city, mode)}</span>;
}

/* ──────────────────────────────────────────────
 * EValue — localize a finite status/placeholder value for E Mode.
 * Falls back to original value if no mapping exists.
 * ────────────────────────────────────────────── */
interface EValueProps {
  value: string;
  className?: string;
}

export function EValue({ value, className }: EValueProps) {
  const { mode } = useLanguageMode();
  if (mode !== 'en') return <span className={className}>{value}</span>;
  // 单一数据源：状态值 / 学历 / 经验 的枚举映射统一维护在 localized-helpers。
  return <span className={className}>{localizeDisplayValue(value, mode)}</span>;
}
