'use client';

import * as React from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { contact } from '@/lib/contact';
import { trackEvent } from '@/lib/analytics';
import { useLanguageMode } from '@/lib/language-mode';

interface WechatConsultDialogProps {
  children: React.ReactNode;
  /** 埋点来源标识，如 'join_section' / 'job_detail' */
  source?: string;
}

/**
 * 微信咨询弹窗：展示顾问姓名、微信号与真实二维码。
 * 复用现有 Dialog 组件；二维码使用普通 <img>，避免 Next Image 缓存问题。
 */
export function WechatConsultDialog({ children, source = 'wechat_consult' }: WechatConsultDialogProps) {
  const { mode } = useLanguageMode();
  const en = mode === 'en';
  const t = (zh: string, enText: string) => (en ? enText : zh);
  const [wechatCopied, setWechatCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(contact.wechat);
      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    } catch {
      /* clipboard 不可用时静默失败，用户仍可手动查看微信号 */
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      trackEvent('wechat_consult', { source });
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-border bg-card text-foreground sm:max-w-sm">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
            <MessageCircle className="h-5 w-5 text-accent" />
            {t('微信咨询', 'WeChat Consult')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('添加顾问微信，获取岗位详情与投递建议。', 'Add our consultant on WeChat for job details and application advice.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* 顾问信息 */}
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">{t('顾问', 'Consultant')}</p>
            <p className="mt-0.5 text-base font-medium text-foreground">{contact.consultantName}</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{t('微信：', 'WeChat: ')}</p>
              <code className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground">
                {contact.wechat}
              </code>
              <button
                onClick={copyWechat}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:text-foreground"
                aria-label={t('复制微信号', 'Copy WeChat ID')}
              >
                {wechatCopied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 二维码（普通 img，1:1 不拉伸） */}
          <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={contact.wechatQr}
              alt={t(`微信二维码 ${contact.consultantName}`, `WeChat QR Code ${contact.consultantName}`)}
              className="mx-auto aspect-square h-auto w-full max-w-[220px] object-contain"
            />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t('打开微信「扫一扫」，添加顾问为好友', 'Open WeChat, tap "Scan", and add the consultant as a friend')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
