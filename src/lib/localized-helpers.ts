/**
 * Lightweight localization helpers for E Mode.
 *
 * Only handles finite, controlled display values:
 * - City names (Chinese → English)
 * - Education / experience requirement values (finite set, from job_publications)
 * - Status/placeholder values (待确认 → To be confirmed)
 *
 * Does NOT translate free-form text, job titles or job body content.
 * Those remain Chinese by design (see docs/HANDOVER.md §3).
 *
 * 维护约定：新增枚举值时，请按数据库中的真实取值补充映射
 * （job_publications.education / job_publications.experience）。
 * 未命中映射的值一律原样输出，不做猜测。
 */

import type { LanguageMode } from '@/lib/language-mode';

/**
 * 归一化查找键：去除首尾与内部空白（含全角空格），
 * 避免“3年以上”与“3 年以上”这类录入差异导致漏翻。
 */
function normKey(value: string): string {
  return value.trim().replace(/\s+/g, '');
}

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
 * 先查城市映射；未命中时回落到受控值解析链（例如城市字段被填成“待确认”）。
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeCity(city: string, mode: LanguageMode): string {
  if (mode !== 'en' || !city) return city;
  return CITY_EN_MAP[city] ?? resolveControlledValue(city);
}

/* ──────────────────────────────────────────────
 * Status / placeholder value mapping
 * Covers finite, known display values only.
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

/* ──────────────────────────────────────────────
 * Education requirement mapping
 * 取值来源：job_publications.education（已发布岗位的真实枚举）
 * ────────────────────────────────────────────── */
const EDUCATION_EN_MAP: Record<string, string> = {
  '硕士及以上': "Master's degree or above",
  '硕士': "Master's degree",
  '本科': "Bachelor's degree",
  '本科及以上': "Bachelor's degree or above",
  '统招本科': "Full-time Bachelor's degree",
  '大专': 'Associate degree',
  '博士': 'PhD',
  '博士及以上': 'PhD or above',
  '硕士及以上，博士优先': "Master's degree or above, PhD preferred",
  '硕士/博士，或具备3年以上半导体PIE经验':
    "Master's/PhD, or 3+ years of semiconductor PIE experience",
  '金融、经济或管理相关专业优先': 'Finance, economics or management background preferred',
};

/* ──────────────────────────────────────────────
 * Experience requirement mapping
 * 取值来源：job_publications.experience（已发布岗位的真实枚举）
 * 键为去除空白后的归一化值。
 * ────────────────────────────────────────────── */
const EXPERIENCE_EN_MAP: Record<string, string> = {
  '实习岗位；年限待确认': 'Internship; years of experience to be confirmed',
  '初级岗位；年限待确认': 'Junior role; years of experience to be confirmed',
  '封装或半导体行业5年以上': '5+ years in packaging or semiconductor industry',
  '飞秒激光、光波导或纳米结构加工经验优先':
    'Femtosecond laser, optical waveguide or nanostructure fabrication experience preferred',
  '中高级，需有AMDXilinxRFSoC完整项目经验':
    'Mid-senior level; end-to-end AMD Xilinx RFSoC project experience required',
  '量子算法/计算化学5年以上，团队管理3年以上':
    '5+ years in quantum algorithms / computational chemistry, 3+ years in team management',
  '8年以上政府关系经验，需有省级以上科技项目申报经验':
    '8+ years of government relations experience, incl. provincial-level sci-tech project applications',
  '需有完整流片和良率提升经验':
    'Hands-on tape-out and yield improvement experience required',
  '高级岗，需有射频系统或子模块开发经验':
    'Senior role; RF system or sub-module development experience required',
  '资深岗3年以上编译器、虚拟机、HPC或底层软件经验':
    'Senior role; 3+ years in compilers, virtual machines, HPC or low-level software',
  '资深岗3年以上底层系统、中间件或大型设备控制系统经验':
    'Senior role; 3+ years in low-level systems, middleware or large equipment control systems',
  '未明确，需有Zynq/RFSoC软硬件协同经验':
    'Not specified; Zynq/RFSoC hardware-software co-design experience required',
  '需有超净间微纳加工和至少一个核心工艺模块经验':
    'Cleanroom micro/nano fabrication and at least one core process module experience required',
  '战略规划5年以上，量子/光芯片研发背景5年以上':
    '5+ years in strategic planning and 5+ years in quantum / photonic chip R&D',
  '资本市场/IPO5年以上，完整参与IPO全流程':
    '5+ years in capital markets / IPO, with end-to-end IPO involvement',
  '3年以上后端、平台或AI系统开发经验':
    '3+ years in backend, platform or AI system development',
  '3年以上运行时、HPC、深度学习底层或异构计算经验':
    '3+ years in runtime, HPC, deep-learning infrastructure or heterogeneous computing',
  '生物大分子、酶催化或QM/MM经验优先':
    'Biomacromolecule, enzyme catalysis or QM/MM experience preferred',
  '需有至少一个量子算法方向的实际项目经验':
    'Hands-on project experience in at least one quantum algorithm area required',
  '8年以上一级市场IR/FA经验，需有硬科技大额融资交割案例':
    '8+ years in primary-market IR/FA, incl. large deep-tech financing deals',
  '3年以上全栈或后端经验，有线上运维和平台落地经验':
    '3+ years full-stack or backend, with production operations and platform delivery experience',
  '需有大模型预训练、分布式训练和复杂项目主导经验':
    'LLM pre-training, distributed training and complex project leadership experience required',
  '高级岗，需有超导量子芯片工艺经验':
    'Senior role; superconducting quantum chip process experience required',
};

/**
 * 纯数值型经验描述兜底转换：
 *   "3-5年" → "3-5 years"、"5年以上" → "5+ years"、"3年" → "3 years"
 * 用于覆盖尚未进入枚举表但格式固定的新录入值。
 */
function tryNumericExperience(value: string): string | null {
  const compact = value.trim().replace(/\s+/g, '');
  const range = /^(\d+)[-–—~至](\d+)年(及?以上)?$/.exec(compact);
  if (range) return `${range[1]}-${range[2]} years`;
  const above = /^(\d+)年(及?以上)$/.exec(compact);
  if (above) return `${above[1]}+ years`;
  const exact = /^(\d+)年$/.exec(compact);
  if (exact) return `${exact[1]} years`;
  return null;
}

/**
 * 统一解析链：状态值 → 学历 → 经验 → 纯数值格式。
 * 三类映射的键互不冲突，共用一条链可以覆盖“学历字段里填了待确认”这类混填情况。
 */
function resolveControlledValue(value: string): string {
  const key = normKey(value);
  return (
    STATUS_EN_MAP[value] ??
    STATUS_EN_MAP[key] ??
    EDUCATION_EN_MAP[key] ??
    EXPERIENCE_EN_MAP[key] ??
    tryNumericExperience(value) ??
    value
  );
}

/**
 * Localize an education requirement value for E Mode.
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeEducation(value: string, mode: LanguageMode): string {
  if (mode !== 'en' || !value) return value;
  return resolveControlledValue(value);
}

/**
 * Localize an experience requirement value for E Mode.
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeExperience(value: string, mode: LanguageMode): string {
  if (mode !== 'en' || !value) return value;
  return resolveControlledValue(value);
}

/**
 * Localize a finite status / education / experience display value for E Mode.
 * Returns the original value if no mapping exists or mode is 'zh'.
 */
export function localizeDisplayValue(value: string, mode: LanguageMode): string {
  if (mode !== 'en' || !value) return value;
  return resolveControlledValue(value);
}
