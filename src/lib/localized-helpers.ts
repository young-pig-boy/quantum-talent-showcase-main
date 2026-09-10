/**
 * Lightweight localization helpers for E Mode.
 *
 * Only handles finite, controlled display values:
 * - City names (Chinese → English)
 * - Status/placeholder values (待确认 → To be confirmed)
 *
 * Does NOT translate free-form text or dynamic job content.
 */

import type { LanguageMode } from '@/lib/language-mode';

/* ──────────────────────────────────────────────
 * City name mapping (Chinese → English)
 * Covers cities that actually appear in job data.
 * Unknown cities fall through to original value.
 * ────────────────────────────────────────────── */
const CITY_EN_MAP: Record<string, string> = {
  '北京': 'Beijing',
  '上海': 'Shanghai',
  '深圳': 'Shenzhen',
  '杭州': 'Hangzhou',
  '合肥': 'Hefei',
  '广州': 'Guangzhou',
  '南京': 'Nanjing',
  '苏州': 'Suzhou',
  '成都': 'Chengdu',
  '武汉': 'Wuhan',
  '西安': "Xi'an",
  '重庆': 'Chongqing',
  '天津': 'Tianjin',
  '长沙': 'Changsha',
  '郑州': 'Zhengzhou',
  '青岛': 'Qingdao',
  '济南': 'Jinan',
  '无锡': 'Wuxi',
  '宁波': 'Ningbo',
  '东莞': 'Dongguan',
  '佛山': 'Foshan',
  '厦门': 'Xiamen',
  '珠海': 'Zhuhai',
  '大连': 'Dalian',
  '沈阳': 'Shenyang',
  '哈尔滨': 'Harbin',
  '昆明': 'Kunming',
  '贵阳': 'Guiyang',
  '太原': 'Taiyuan',
  '石家庄': 'Shijiazhuang',
  '福州': 'Fuzhou',
  '南昌': 'Nanchang',
  '南宁': 'Nanning',
  '兰州': 'Lanzhou',
  '呼和浩特': 'Hohhot',
  '乌鲁木齐': 'Urumqi',
  '拉萨': 'Lhasa',
  '银川': 'Yinchuan',
  '西宁': 'Xining',
  // Province-level values that may appear after normalization
  '浙江': 'Zhejiang',
  '江苏': 'Jiangsu',
  '安徽': 'Anhui',
  '广东': 'Guangdong',
  '四川': 'Sichuan',
  '湖北': 'Hubei',
  '湖南': 'Hunan',
  '山东': 'Shandong',
  '河北': 'Hebei',
  '河南': 'Henan',
  '福建': 'Fujian',
  '江西': 'Jiangxi',
  '陕西': 'Shaanxi',
  '辽宁': 'Liaoning',
  '吉林': 'Jilin',
  '黑龙江': 'Heilongjiang',
  '云南': 'Yunnan',
  '贵州': 'Guizhou',
  '甘肃': 'Gansu',
  '山西': 'Shanxi',
  '海南': 'Hainan',
  '内蒙古': 'Inner Mongolia',
  '广西': 'Guangxi',
  '西藏': 'Tibet',
  '宁夏': 'Ningxia',
  '新疆': 'Xinjiang',
  // Special values
  '全国': 'Nationwide',
  '海外': 'Overseas',
  '远程': 'Remote',
  '线上': 'Online',
  '不限': 'Anywhere',
};

/**
 * Localize a city/location string for E Mode.
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeCity(city: string, mode: LanguageMode): string {
  if (mode !== 'en' || !city) return city;
  return CITY_EN_MAP[city] ?? city;
}

/* ──────────────────────────────────────────────
 * Status / placeholder value mapping
 * Covers finite, known display values only.
 * Free-form Chinese text passes through unchanged.
 * ────────────────────────────────────────────── */
const STATUS_EN_MAP: Record<string, string> = {
  '待确认': 'To be confirmed',
  '待从详情页确认': 'To be confirmed',
  '未明确': 'Not specified',
  '面议': 'Negotiable',
  '不限': 'Not specified',
  'Remote': 'Remote',
  'remote': 'Remote',
};

/**
 * Localize a finite status/placeholder display value for E Mode.
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeDisplayValue(value: string, mode: LanguageMode): string {
  if (mode !== 'en' || !value) return value;
  return STATUS_EN_MAP[value] ?? value;
}
