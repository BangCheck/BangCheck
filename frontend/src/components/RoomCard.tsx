import { cn } from '@/lib/utils';

interface RoomCardProps {
  id: string;
  name: string;
  address: string;
  type: '전세' | '월세';
  floor?: string;
  direction?: string;
  price: string;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export default function RoomCard({
  id,
  name,
  address,
  type,
  floor,
  direction,
  price,
  onDelete,
  onClick,
}: RoomCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(id)}
      onKeyDown={handleKeyDown}
      className={cn(
        "room-card relative p-4 rounded-lg border border-border-light bg-white hover:border-brand-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
      )}
    >
      <button
        type="button"
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(id); 
        }}
        className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-text-caption hover:text-red-500 transition-colors"
        aria-label={`${name} 방 삭제`}
      >
        <span className="text-xl">🗑</span>
      </button>
      <h3 className="text-lg font-semibold text-text-main mb-1 pr-10">{name}</h3>
      <p className="text-sm text-text-main/70 mb-2">{address}</p>
      <p className="text-sm font-medium text-brand-primary">
        {type}
        {floor && ` · ${floor}`}
        {direction && ` · ${direction}`}
        {` · ${price}`}
      </p>
    </div>
  );
}
