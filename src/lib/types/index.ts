export type JobStatus = 'active' | 'closed' | 'paused';
export type TrackStatus = 'active' | 'archived';
export type PartnerType = 'enterprise' | 'research' | 'institution';

export interface SiteConfig {
  platformName: string;
  platformNameEn: string;
  logo: string;
  heroTitle: string;
  heroTitleLine2: string;
  heroEnglishTagline: string;
  heroEnglishTaglineLine2: string;
  heroSubtitle: string;
  /** English Mode 时展示的 Hero 固定文案 */
  heroTitleEn: string;
  heroSubtitleEn: string;
  heroBackground: string;
  desktopHeroBackground: string;
  mobileHeroBackground: string;
  contactEmail: string;
  wechatId: string;
  wechatQrCode: string;
  footerText: string;
  footerTextEn: string;
  seoTitle: string;
  seoDescription: string;
  shareTitle: string;
  shareImage: string;
}

export interface TechRoute {
  id: string;
  name: string;
  description: string;
}

export interface TalentType {
  name: string;
  description: string;
}

export interface Track {
  id: string;
  name: string;
  englishName: string;
  description: string;
  /** English Mode 下展示的固定英文描述 */
  enDescription: string;
  keywords: string[];
  image: string;
  order: number;
  status: TrackStatus;
  overview: string;
  techRoutes: TechRoute[];
  applications: string[];
  talentTypes: TalentType[];
  heroGradient: string;
}

export interface Job {
  id: string;
  title: string;
  englishTitle: string;
  company: string;
  trackId: string;
  city: string;
  education: string;
  experience: string;
  direction: string;
  seniority: string;
  tags: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  urgent: boolean;
  publishedAt: string;
  updatedAt: string;
  status: JobStatus;
}

export interface Partner {
  id: string;
  name: string;
  englishName: string;
  logo: string;
  type: PartnerType;
  link: string;
  order: number;
}

export interface JobFilterState {
  keyword: string;
  trackId: string;
  city: string;
  urgentOnly: boolean;
}

export interface ToastState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}
