'use client';

import { useState, useEffect } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { siteConfig } from '@/lib/data';
import { trackEvent } from '@/lib/analytics';
import { useLanguageMode } from '@/lib/language-mode';
import { toast } from 'sonner';
import type { ApplyJobData } from './apply-drawer';

interface ShareButtonProps {
  job: ApplyJobData;
}

export function ShareButton({ job }: ShareButtonProps) {
  const { mode } = useLanguageMode();
  const en = mode === 'en';
  const t = (zh: string, enText: string) => (en ? enText : zh);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/jobs/${job.slug}`);
    }
  }, [job.id]);

  const handleShare = async () => {
    trackEvent('share', { action: 'job_share', job_id: job.id });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} | ${siteConfig.platformName}`,
          text: `${job.title} · ${job.city}`,
          url,
        });
        toast.success(en ? 'Share successful' : '分享成功');
        return;
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        if (error instanceof Error && error.name !== 'AbortError') {
          // fall through
        }
      }
    }

    await handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(en ? 'Job link copied' : '岗位链接已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(en ? 'Copy failed, please copy the link manually' : '复制失败，请手动复制链接');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-border bg-muted text-foreground hover:border-border hover:bg-muted"
        >
          <Share2 className="mr-2 h-4 w-4" />
          {t('分享岗位', 'Share Job')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{t('分享岗位', 'Share Job')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('通过系统分享或复制链接，将岗位分享给合适的候选人。', 'Share this position with suitable candidates via system share or by copying the link.')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.title} · {job.city}</p>
          </div>
          <div className="flex gap-2">
            <Input
              readOnly
              value={url}
              className="h-11 rounded-xl border-border bg-muted text-foreground"
            />
            <Button
              onClick={handleCopy}
              className="h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-accent-light"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={handleShare}
            className="w-full rounded-xl bg-accent text-secondary-foreground hover:bg-accent-light"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? t('调用系统分享', 'System Share') : t('复制链接', 'Copy Link')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
