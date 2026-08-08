import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { formatCurrency } from '@/lib/formatters';
import { AnimatedCounter } from './Reveal';
import type { Product } from '@/types/product';

function FeaturedCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const href = `/product/${product.slug ?? product._id}`;
  const compareAt =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-200/50">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-blue-200/60 to-violet-200/60 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <Link to={href} className="relative aspect-square w-full overflow-hidden bg-slate-50">
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
          <Badge
            variant="destructive"
            className="absolute left-3 top-3 rounded-full px-2.5"
          >
            Sale
          </Badge>
        )}
        <button
          onClick={() => toast.info('Wishlist is coming soon ✨')}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {product.brand || 'ShopCart'}
        </div>
        <Link to={href} className="line-clamp-2 font-semibold leading-snug text-slate-800 hover:text-blue-600">
          {product.name}
        </Link>
        <Rating value={product.ratingsAverage} count={product.ratingsQuantity} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
          {compareAt && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(compareAt)}
            </span>
          )}
        </div>
        <AddToCartButton productId={product._id} stock={product.stock} />
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border border-white/70 bg-white/70 p-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function FeaturedProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  return (
    <section className="container py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Handpicked
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Featured products
            <Sparkles className="h-6 w-6 text-violet-500" />
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            <AnimatedCounter to={products.length} suffix=" curated picks this week" />
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FeaturedSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          No featured products yet — check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <FeaturedCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}