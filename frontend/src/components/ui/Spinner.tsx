export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'w-6 h-6 border-2', md: 'w-8 h-8 border-4', lg: 'w-10 h-10 border-4' }[size];
  return (
    <div className={`${cls} border-brand-primary border-t-transparent rounded-full animate-spin`} />
  );
}
