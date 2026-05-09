import { cn } from '@/lib/utils';
import SectionNumberIcon from './SectionNumberIcon';

interface SectionContainerProps {
  number: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionContainer({ number, title, children, className }: SectionContainerProps) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center gap-2">
        <SectionNumberIcon number={number} />
        <h2 className="text-[18px] font-semibold text-text-main">{title}</h2>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
