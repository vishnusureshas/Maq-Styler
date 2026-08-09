import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const href = `/product/${product.slug ?? product._id}`;
  const isOut = product.stock <= 0;
  const compareAt =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300',
        isOut
          ? 'border-slate-200/70'
          : 'border-slate-100 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-200/50'
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 rounded-full bg-gradient-to-br from-violet-200/60 to-fuchsia-200/60 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <Link to={href} className="relative z-10 aspect-square w-full overflow-hidden bg-violet-50/60">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
        {compareAt && (
          <Badge className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 text-white shadow-sm">
            Sale
          </Badge>
        )}
        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-sm font-bold text-white">
              Out of stock
            </span>
          </div>
        )}
        <div className="absolute right-3 top-3 z-20">
          <WishlistButton product={product} />
        </div>
      </Link>

      <div className="relative z-10 flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-violet-500">
          {product.brand || 'ShopCart'}
        </div>
        <Link
          to={href}
          className="line-clamp-2 font-semibold leading-snug text-slate-800 hover:text-violet-600"
        >
          {product.name}
        </Link>
        <Rating value={product.ratingsAverage} count={product.ratingsQuantity} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
          {compareAt && (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(compareAt)}</span>
          )}
        </div>
        <AddToCartButton productId={product._id} stock={product.stock} />
      </div>
    </div>
  );
}