import type { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider, THEME_INIT_SCRIPT } from '@/components/theme-provider';
import { GlobalClickEffect } from '@/components/global-click-effect';
import { LanguageModeProvider } from '@/lib/language-mode';
import './globals.css';
import { siteConfig } from '@/lib/data';

const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';

export const metadata: Metadata = {
  metadataBase: new URL(domain),
  title: {
    default: siteConfig.seoTitle,
    template: `%s | ${siteConfig.platformName}`,
  },
  description: siteConfig.seoDescription,
  keywords: [
    '量子科技',
    '量子计算',
    '量子人才',
    '超导量子',
    '离子阱',
    '光量子',
    '量子通信',
    '量子测量',
    '高端招聘',
  ],
  authors: [{ name: siteConfig.platformName }],
  openGraph: {
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
    siteName: siteConfig.platformName,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.shareImage,
        width: 1200,
        height: 630,
        alt: siteConfig.platformName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seoTitle,
    description: siteConfig.seoDescription,
    images: [siteConfig.shareImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <LanguageModeProvider>
            {children}
            <GlobalClickEffect />
            <ThemedToaster />
          </LanguageModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

/** Toaster with theme-aware styles — must be inside ThemeProvider */
function ThemedToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'theme-toast',
        },
      }}
    />
  );
}
