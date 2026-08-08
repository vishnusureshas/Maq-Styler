import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}