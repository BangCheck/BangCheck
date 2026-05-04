import { cn } from '@/lib/utils';
import { SECTION_PADDING } from './constants';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ children, className }: SectionWrapperProps) {
  return (
    <section className={cn(SECTION_PADDING, 'w-full', className)}>
      {children}
    </section>
  );
}
