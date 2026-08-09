import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist, isInWishlist } from '@/store/slices/wishlistSlice';
import type { Product } from '@/types/product';

export function WishlistButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const active = useAppSelector(isInWishlist(product._id));
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!pop) return;
    const id = window.setTimeout(() => setPop(false), 350);
    return () => window.clearTimeout(id);
  }, [pop]);

  const onClick = () => {
    dispatch(toggleWishlist(product));
    setPop(true);
    toast.success(active ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors duration-200 hover:text-rose-500',
        active && 'border-rose-200 text-rose-500',
        pop && 'animate-pop-in',
        className
      )}
    >
      <Heart
        className={cn('h-4 w-4 transition-all duration-200', active && 'fill-rose-500 text-rose-500')}
      />
    </button>
  );
}