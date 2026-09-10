'use client';

/**
 * LanguageMode — 极薄的语言模式层。
 *
 * 只负责一件事：当前是不是 English Mode。
 * 不引入 i18n 框架、不持久化（避免 hydration mismatch / 中文先闪现）、
 * 不驱动任何业务数据（岗位数据永远是原始中文）。
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
  if (mode !== 'en') return <span className={className}>{city}</span>;
  // Inline lightweight mapping to avoid circular imports
  const cityMap: Record<string, string> = {
    '北京': 'Beijing', '上海': 'Shanghai', '深圳': 'Shenzhen',
    '杭州': 'Hangzhou', '合肥': 'Hefei', '广州': 'Guangzhou',
    '南京': 'Nanjing', '苏州': 'Suzhou', '成都': 'Chengdu',
    '武汉': 'Wuhan', '西安': "Xi'an", '重庆': 'Chongqing',
    '天津': 'Tianjin', '长沙': 'Changsha', '郑州': 'Zhengzhou',
    '青岛': 'Qingdao', '济南': 'Jinan', '无锡': 'Wuxi',
    '宁波': 'Ningbo', '东莞': 'Dongguan', '佛山': 'Foshan',
    '厦门': 'Xiamen', '珠海': 'Zhuhai', '大连': 'Dalian',
    '沈阳': 'Shenyang', '哈尔滨': 'Harbin', '昆明': 'Kunming',
    '贵阳': 'Guiyang', '太原': 'Taiyuan', '福州': 'Fuzhou',
    '南昌': 'Nanchang', '南宁': 'Nanning', '兰州': 'Lanzhou',
    '全国': 'Nationwide', '海外': 'Overseas', '远程': 'Remote',
    '线上': 'Online', '不限': 'Anywhere',
    '浙江': 'Zhejiang', '江苏': 'Jiangsu', '安徽': 'Anhui',
    '广东': 'Guangdong', '四川': 'Sichuan', '湖北': 'Hubei',
    '湖南': 'Hunan', '山东': 'Shandong', '河北': 'Hebei',
    '河南': 'Henan',
  };
  return <span className={className}>{cityMap[city] ?? city}</span>;
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
  const valueMap: Record<string, string> = {
    '待确认': 'To be confirmed',
    '待从详情页确认': 'To be confirmed',
    '未明确': 'Not specified',
    '面议': 'Negotiable',
    '不限': 'Not specified',
  };
  return <span className={className}>{valueMap[value] ?? value}</span>;
}
