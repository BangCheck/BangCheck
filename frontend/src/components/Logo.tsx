import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <div
      style={{ height: size, width: 'auto' }}
      className={cn('relative flex items-center', className)}
    >
      <img
        src="/images/logo-big.svg"
        alt="방체크 로고"
        style={{ width: 'auto', height: `${size}px` }}
        className="object-contain"
      />
    </div>
  );
}

export function LogoWithText({ size = 24, textClassName }: LogoProps & { textClassName?: string }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Logo size={size} />
      <p className={cn('text-[#0A607D] whitespace-nowrap flex items-center', textClassName)}>
        <span className="font-semibold">bang</span>
        <span className="font-normal">check</span>
      </p>
    </div>
  );
}
