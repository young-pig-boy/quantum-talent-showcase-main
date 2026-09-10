import Link from 'next/link';
import { siteConfig } from '@/lib/data';
import { EText } from '@/lib/language-mode';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-glass font-mono text-sm font-medium text-quantum-gold">
                Q
              </span>
              <span className="text-base font-medium tracking-tight text-foreground">
                {siteConfig.platformName}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.platformNameEn} —{' '}
              <EText zh="专注量子科技高端人才连接。" en="dedicated to connecting top quantum technology talent." />
            </p>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <EText zh="岗位快车道" en="Job Fast Lane" />
            </p>
            <Link href="/opportunities?urgent=true" className="text-muted-foreground transition-colors hover:text-foreground">
              <EText zh="急招岗位" en="Urgent Hiring" />
            </Link>
            <Link href="/opportunities" className="text-muted-foreground transition-colors hover:text-foreground">
              <EText zh="岗位中心" en="Job Center" />
            </Link>
            <Link href="/#quantum-tracks" className="text-muted-foreground transition-colors hover:text-foreground">
              <EText zh="前沿赛道" en="Frontier Tracks" />
            </Link>
            <Link href="/opportunities?featured=true" className="text-muted-foreground transition-colors hover:text-foreground">
              <EText zh="精选岗位" en="Featured Positions" />
            </Link>
          </nav>

          <nav className="flex flex-col gap-3 text-sm">
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <EText zh="赛道" en="Tracks" />
            </p>
            <Link href="/tracks/superconducting" className="text-muted-foreground transition-colors hover:text-foreground">
              超导量子
            </Link>
            <Link href="/tracks/ion-trap" className="text-muted-foreground transition-colors hover:text-foreground">
              离子阱
            </Link>
            <Link href="/tracks/photonics" className="text-muted-foreground transition-colors hover:text-foreground">
              光量子
            </Link>
            <Link href="/tracks/communication-sensing" className="text-muted-foreground transition-colors hover:text-foreground">
              量子通信与测量
            </Link>
          </nav>

          <nav className="flex flex-col gap-3 text-sm">
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <EText zh="联系" en="Contact" />
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {siteConfig.contactEmail}
            </a>
            <p className="text-muted-foreground">
              <EText zh={`微信：${siteConfig.wechatId}`} en={`WeChat: ${siteConfig.wechatId}`} />
            </p>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground md:text-left">
            <EText zh={siteConfig.footerText} en={siteConfig.footerTextEn} />
          </p>
        </div>
      </div>
    </footer>
  );
}
