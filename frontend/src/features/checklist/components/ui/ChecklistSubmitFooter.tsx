import { cn } from '@/lib/utils';

type Props = {
  label: string;
  disabled: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClick: () => void;
  /** Atlas 상세 캔버스용 식별자. 페이지가 넘긴다 */
  atlasNode?: string;
  atlasLabel?: string;
};

export function ChecklistSubmitFooter({ label, disabled, isSubmitting, error, onClick, atlasNode, atlasLabel }: Props) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 pt-4 z-30"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      data-atlas-node={atlasNode}
      data-atlas-label={atlasLabel}
    >
      <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-2">
        {error && (
          <p className="text-[12px] text-red-500 text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'w-full py-3.5 rounded-[6px] text-fluid-lg font-bold transition-all',
            disabled
              ? 'bg-border-mute text-white cursor-not-allowed'
              : 'bg-brand-primary text-white hover:bg-brand-primary-dark cursor-pointer',
          )}
        >
          {isSubmitting ? '저장 중...' : label}
        </button>
      </div>
    </div>
  );
}
