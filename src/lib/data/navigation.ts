export interface NavItem {
  id: string;
  label: string;
  /** English Mode 时展示的固定 UI 文案（本轮仅增加，不替换 label） */
  labelEn?: string;
  sectionId: string;
  href: string;
  isPageRoute?: boolean;
}

export interface SubNavItem {
  id: string;
  label: string;
  /** English Mode 时展示的固定 UI 文案 */
  labelEn?: string;
  href: string;
  isPageRoute?: boolean;
  sectionId?: string;
}

export const brandConfig = {
  name: '嘉驰国际',
  logo: '/brand/jiachi-logo-transparent.png',
  logoAlt: 'X-GIANTS GROUP · 嘉驰国际',
  logoSubtext: '点击查看官网',
  homepageUrl: 'https://x-giants.com/',
  display: '仅Logo' as const,
};

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: '首页',
    labelEn: 'Home',
    sectionId: 'hero',
    href: '#',
  },
  {
    id: 'job-fast-lane',
    label: '岗位快车道',
    labelEn: 'Job Fast Lane',
    sectionId: 'job-fast-lane',
    href: '#job-fast-lane',
  },
  {
    id: 'partners',
    label: '合作机构',
    labelEn: 'Partners',
    sectionId: 'partners',
    href: '#partners',
  },
  {
    id: 'join',
    label: '联系我们',
    labelEn: 'Contact Us',
    sectionId: 'join-network',
    href: '#join-network',
  },
];

/**
 * Secondary navigation items under "岗位快车道"
 * All items are anchor-type, scrolling to sections within the Job Fast Lane area.
 * Order: 岗位中心 → 急招岗位 → 精选岗位 → 前沿赛道
 */
export const jobFastLaneSubItems: SubNavItem[] = [
  {
    id: 'job-center',
    label: '岗位中心',
    labelEn: 'Job Center',
    href: '#job-center',
    sectionId: 'job-center',
  },
  {
    id: 'urgent',
    label: '急招岗位',
    labelEn: 'Urgent Hiring',
    href: '#urgent-jobs',
    sectionId: 'urgent-jobs',
  },
  {
    id: 'featured',
    label: '精选岗位',
    labelEn: 'Featured Positions',
    href: '#featured-jobs',
    sectionId: 'featured-jobs',
  },
  {
    id: 'tracks',
    label: '前沿赛道',
    labelEn: 'Frontier Tracks',
    href: '#quantum-tracks',
    sectionId: 'quantum-tracks',
  },
];

export const ctaNavItem: NavItem = {
  id: 'explore',
  label: '探索岗位',
  labelEn: 'Explore Jobs',
  sectionId: '',
  href: '/opportunities',
  isPageRoute: true,
};
