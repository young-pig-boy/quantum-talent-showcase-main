import type { SiteConfig } from '@/lib/types';
import { contact } from '@/lib/contact';

export const siteConfig: SiteConfig = {
  platformName: '量子人才网络',
  platformNameEn: 'Quantum Talent Network',
  logo: '/logo.svg',
  heroTitle: '量子科技人才招聘平台',
  heroTitleLine2: '',
  heroEnglishTagline: 'QUANTUM TALENT PLATFORM',
  heroEnglishTaglineLine2: '',
  heroSubtitle:
    '汇集量子计算、量子通信、量子测量等方向的优质岗位机会',
  heroTitleEn: 'Quantum Talent Hiring Platform',
  heroSubtitleEn:
    'Curated opportunities across quantum computing, quantum communication, and quantum sensing.',
  heroBackground: '/hero-bg.jpg',
  desktopHeroBackground: '/hero-desktop.jpg',
  mobileHeroBackground: '/hero-mobile.jpg',
  contactEmail: contact.email,
  wechatId: contact.wechat,
  wechatQrCode: contact.wechatQr,
  footerText: '© 2026 量子人才网络. 专注量子科技高端人才连接.',
  footerTextEn: '© 2026 Quantum Talent Network. Dedicated to connecting top quantum technology talent.',
  seoTitle: '量子人才网络 | 连接量子科技与下一代顶尖人才',
  seoDescription:
    '专注超导量子、离子阱、光量子、量子通信与测量等前沿赛道，为科学家、工程师与研究机构搭建稀缺的人才连接通道。',
  shareTitle: '发现一个量子科技岗位',
  shareImage: '/hero-bg.jpg',
};
