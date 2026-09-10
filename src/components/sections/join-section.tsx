'use client';

import { Copy, MessageCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { WechatConsultDialog } from '@/components/ui/wechat-consult-dialog';
import { siteConfig } from '@/lib/data';
import { contact } from '@/lib/contact';
import { trackEvent } from '@/lib/analytics';
import { useLanguageMode } from '@/lib/language-mode';

export function JoinSection() {
  const { mode } = useLanguageMode();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(siteConfig.contactEmail).then(() => {
      trackEvent('email_copy', { source: 'join_section' });
    });
  };

  return (
    <section id="join-network" className="relative overflow-hidden bg-section-alt py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: text */}
          <ScrollReveal className="flex flex-col justify-center">
            <p className="mb-4 font-mono text-xs font-medium tracking-[0.2em] text-quantum-gold uppercase">
              Join the Network
            </p>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {mode === 'en' ? 'Join the Talent Network' : '加入量子人才会客厅'}
            </h2>
            <p className="mb-8 max-w-lg leading-[1.8] text-muted-foreground">
              {mode === 'en'
                ? "Whether you're a researcher or engineer in quantum physics, materials science, optoelectronics, or computer science, join the Quantum Talent Network for first access to frontier job opportunities and technical exchange."
                : '无论你是量子物理、材料科学、光电子、计算机科学背景的研究者或工程师，我们欢迎你加入量子人才会客厅，第一时间获取前沿岗位信息与技术交流机会。'}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-glass px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-surface-glass-hover"
              >
                <Copy className="h-4 w-4" />
                {mode === 'en' ? 'Copy Email' : '复制联系邮箱'}
              </button>
              <WechatConsultDialog source="join_section">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-surface-glass">
                  <MessageCircle className="h-4 w-4" />
                  {mode === 'en' ? 'WeChat Consult' : '微信咨询'}
                </button>
              </WechatConsultDialog>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              {siteConfig.contactEmail}
            </p>
          </ScrollReveal>

          {/* Right: liquid glass card with contact info */}
          <ScrollReveal delay={0.1}>
            <LiquidGlass className="h-full p-8 sm:p-10">
              <div className="space-y-8">
                <div>
                  <p className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                    Email
                  </p>
                  <p className="text-lg text-foreground">{siteConfig.contactEmail}</p>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                    WeChat
                  </p>
                  <p className="text-sm text-muted-foreground">{contact.consultantName}</p>
                  <p className="text-lg text-foreground">{siteConfig.wechatId}</p>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="mb-4 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                    Scan to Connect
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteConfig.wechatQrCode}
                    alt="WeChat QR Code"
                    className="h-40 w-40 rounded-lg bg-surface-glass object-contain"
                  />
                </div>
              </div>
            </LiquidGlass>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
