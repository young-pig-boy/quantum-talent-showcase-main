import { cn } from '@/lib/utils';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong';
}

export function LiquidGlass({ children, className, variant = 'default' }: LiquidGlassProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variant === 'strong' ? 'liquid-glass-strong' : 'liquid-glass',
        'hover:bg-surface-glass-hover hover:border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}
