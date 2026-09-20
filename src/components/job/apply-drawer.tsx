'use client';

import { useState, useCallback } from 'react';
import { Mail, MessageCircle, Copy, Check, AlertCircle, Send, User, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { siteConfig } from '@/lib/data';
import { contact } from '@/lib/contact';
import { trackEvent } from '@/lib/analytics';
import { useApply } from '@/hooks/use-apply';
import { JobCode } from '@/components/job/job-code';
import { useLanguageMode } from '@/lib/language-mode';
import { toast } from 'sonner';

export interface ApplyJobData {
  id: string;
  slug: string;
  title: string;
  city: string;
  /** 岗位业务编号（QJ-26-XXXX），来自 job_publications.public_job_code */
  public_job_code?: string | null;
}

interface ApplyDrawerProps {
  job: ApplyJobData;
  children: React.ReactNode;
  /** 打开抽屉时的初始 Tab，例如「微信咨询」按钮传入 'wechat' */
  initialTab?: ApplyTab;
}

type ApplyTab = 'online' | 'email' | 'wechat';

export function ApplyDrawer({ job, children, initialTab = 'online' }: ApplyDrawerProps) {
  const { mode } = useLanguageMode();
  const en = mode === 'en';
  const t = (zh: string, enText: string) => (en ? enText : zh);
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<ApplyTab>('online');
  const [emailCopied, setEmailCopied] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', notes: '' });
  const { apply, submitting: applySubmitting } = useApply();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const hasEmail = Boolean(siteConfig.contactEmail);
  const hasWechatId = Boolean(siteConfig.wechatId);
  const hasQrCode = Boolean(siteConfig.wechatQrCode);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError('');
  };

  const handleSubmit = useCallback(async () => {
    if (!form.full_name.trim()) { setSubmitError(en ? 'Please enter your name' : '请填写姓名'); return; }
    if (!form.phone.trim() && !form.email.trim()) { setSubmitError(en ? 'Please provide a phone number or an email' : '请至少填写手机号或邮箱'); return; }

    setSubmitting(true);
    setSubmitError('');

    try {
      trackEvent('apply_start', { job_id: job.id, job_slug: job.slug, publication_id: job.id });

      const result = await apply({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        publication_id: job.id,
        notes: form.notes.trim(),
      });

      if (result.success) {
        trackEvent('apply_submit', { job_id: job.id, job_slug: job.slug, publication_id: job.id });
        setSubmitted(true);
        toast.success(en ? 'Application submitted! We will contact you soon.' : '投递成功！我们会尽快与你联系。');
      } else {
        setSubmitError(result.message || (en ? 'Submission failed, please try again.' : '投递失败，请稍后重试'));
        toast.error(result.message || (en ? 'Submission failed' : '投递失败'));
      }
    } catch (_e) {
      setSubmitError(en ? 'Network error, please try again.' : '网络错误，请稍后重试');
      toast.error(en ? 'Network error' : '网络错误');
    } finally {
      setSubmitting(false);
    }
  }, [form, job, apply, en]);

  const handleOpen = (open: boolean) => {
    if (open) {
      trackEvent('apply_start', { job_id: job.id, job_slug: job.slug, publication_id: job.id });
      // Reset form when opening
      setForm({ full_name: '', phone: '', email: '', notes: '' });
      setSubmitted(false);
      setSubmitError('');
      setTab(initialTab);
    }
    setOpen(open);
  };

  const copyEmail = async () => {
    if (!hasEmail) { toast.error(en ? 'Recruitment email not configured' : '招聘邮箱未配置'); return; }
    trackEvent('email_copy', { job_id: job.id, job_slug: job.slug });

    try {
      await navigator.clipboard.writeText(siteConfig.contactEmail);
      setEmailCopied(true);
      toast.success(en ? 'Email copied' : '邮箱已复制');
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      toast.error(en ? 'Copy failed, please copy manually' : '复制失败，请手动复制');
    }
  };

  const copyWechat = async () => {
    if (!hasWechatId) { toast.error(en ? 'WeChat ID not configured' : '微信号未配置'); return; }
    trackEvent('wechat_consult', { job_id: job.id, job_slug: job.slug });

    try {
      await navigator.clipboard.writeText(siteConfig.wechatId);
      setWechatCopied(true);
      toast.success(en ? 'WeChat ID copied' : '微信号已复制');
      setTimeout(() => setWechatCopied(false), 2000);
    } catch {
      toast.error(en ? 'Copy failed, please copy manually' : '复制失败，请手动复制');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className="border-border bg-card text-foreground sm:max-w-md"
      >
        <SheetHeader className="px-6 pt-4 pb-2">
          <SheetTitle className="text-xl font-medium text-foreground">{t('投递与咨询', 'Apply & Contact')}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {t('在线投递简历，或通过邮箱 / 微信联系我们。', 'Apply online, or contact us via email / WeChat.')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-4">
          {/* Job info */}
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="mb-1 text-xs text-muted-foreground">{t('当前意向岗位', 'Position of Interest')}</p>
            <h3 className="text-lg font-medium text-foreground">{job.title}</h3>
            {job.public_job_code && <JobCode code={job.public_job_code} className="mt-1" />}
            <p className="mt-1 text-sm text-muted-foreground">
              {job.city}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border border-border bg-background p-1">
            {(['online', 'email', 'wechat'] as ApplyTab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                  tab === tabKey
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-muted-foreground'
                }`}
              >
                {tabKey === 'online' ? t('在线投递', 'Apply Online') : tabKey === 'email' ? t('邮箱', 'Email') : t('微信', 'WeChat')}
              </button>
            ))}
          </div>

          {/* Online apply form */}
          {tab === 'online' && (
            <div className="space-y-4">
              {submitted ? (
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-8 text-center">
                  <Check className="mx-auto mb-3 h-10 w-10 text-accent" />
                  <p className="mb-1 text-lg font-medium text-foreground">{t('投递成功！', 'Application Submitted!')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('我们会尽快查看你的信息，并在 3 个工作日内与你联系。', "We'll review your application and contact you within 3 business days.")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('姓名 *', 'Name *')}
                      value={form.full_name}
                      onChange={(e) => updateForm('full_name', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-accent/30 focus:ring-2 focus:ring-accent/10 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder={t('手机号', 'Phone')}
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-accent/30 focus:ring-2 focus:ring-accent/10 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder={t('邮箱', 'Email')}
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-accent/30 focus:ring-2 focus:ring-accent/10 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      placeholder={t('备注（选填）', 'Notes (Optional)')}
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-border bg-muted py-3 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-accent/30 focus:ring-2 focus:ring-accent/10 focus:outline-none resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                        {t('提交中...', 'Submitting...')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {t('提交投递', 'Submit Application')}
                      </span>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Email tab */}
          {tab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-accent" />
                {t('招聘邮箱', 'Recruitment Email')}
              </div>
              {hasEmail ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
                    {siteConfig.contactEmail}
                  </code>
                  <Button
                    onClick={copyEmail}
                    className="h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {emailCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  {t('招聘邮箱暂未配置', 'Recruitment email not configured')}
                </div>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                {en ? 'Please send your resume and portfolio to the recruitment email, noting the position name in the subject' : '请将简历与作品集发送至招聘邮箱，并在邮件标题中注明意向岗位名称'}
                {job.public_job_code ? (
                  <>（<span className="font-mono tabular-nums">{job.public_job_code}</span>）</>
                ) : null}
                {en ? '. We reply within 3 business days.' : '。3 个工作日内回复。'}
              </p>
            </div>
          )}

          {/* WeChat tab */}
          {tab === 'wechat' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageCircle className="h-4 w-4 text-accent" />
                {t('微信咨询', 'WeChat Consult')}
              </div>
              {hasWechatId ? (
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs text-muted-foreground">{t('顾问', 'Consultant')}</p>
                  <p className="mt-0.5 text-base font-medium text-foreground">{contact.consultantName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground">
                      {siteConfig.wechatId}
                    </code>
                    <Button
                      onClick={copyWechat}
                      className="h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {wechatCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  {t('微信号暂未配置', 'WeChat ID not configured')}
                </div>
              )}
              {hasQrCode ? (
                <div className="overflow-hidden rounded-xl border border-border bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteConfig.wechatQrCode}
                    alt={t('微信二维码', 'WeChat QR Code')}
                    className="mx-auto aspect-square h-auto w-full max-w-[200px] object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                  {t('微信二维码暂未上传', 'WeChat QR code not uploaded yet')}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
