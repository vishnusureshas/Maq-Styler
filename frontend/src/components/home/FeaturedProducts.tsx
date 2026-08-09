import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { formatCurrency } from '@/lib/formatters';
import { AnimatedCounter, Reveal } from './Reveal';
import type { Product } from '@/types/product';

function discountPercent(product: Product): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return null;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

function BadgeLabel({ product }: { product: Product }) {
  const off = discountPercent(product);
  if (off !== null) {
    return (
      <Badge className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 text-white shadow-sm">
        -{off}%
      </Badge>
    );
  }
  if (product.isFeatured) {
    return (
      <Badge className="rounded-full bg-gradient-to-r from-violet-600 to-purple-500 px-2.5 py-1 text-white shadow-sm">
        Bestseller
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-1 text-white shadow-sm">
      New
    </Badge>
  );
}

function PopularCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const href = `/product/${product.slug ?? product._id}`;
  const compareAt =
    product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-200/50">
      <Link to={href} className="relative aspect-square w-full overflow-hidden bg-violet-50/60">
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
        <div className="absolute left-3 top-3">
          <BadgeLabel product={product} />
        </div>
        <div className="absolute right-3 top-3">
          <WishlistButton product={product} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
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
          <span className="text-lg font-extrabold text-slate-900">
            {formatCurrency(product.price)}
          </span>
          {compareAt && (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(compareAt)}</span>
          )}
        </div>
        <AddToCartButton productId={product._id} stock={product.stock} />
      </div>
    </div>
  );
}

function PopularSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
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
    <section className="py-16">
      <div className="container">
        <Reveal className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
              Handpicked for you
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Popular Picks
              <Sparkles className="h-6 w-6 text-violet-500" />
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              <AnimatedCounter to={products.length} suffix=" curated picks this week" />
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PopularSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            No featured products yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <PopularCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}