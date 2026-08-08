import { Link } from 'react-router-dom';
import { Bot, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { formatCurrency } from '@/lib/formatters';
import { Reveal } from './Reveal';
import type { Product } from '@/types/product';

const fallbackTags = ['Best sellers', 'Trending', 'Under $50', 'Top rated', 'New tech', 'Home style'];

function CuratedCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const href = `/product/${product.slug ?? product._id}`;
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/60 bg-white/85 p-3 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-200/50">
      <Link to={href} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            None
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to={href}
          className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-teal-600"
        >
          {product.name}
        </Link>
        <Rating value={product.ratingsAverage} className="scale-90 origin-left" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">{formatCurrency(product.price)}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toast.info('Wishlist is coming soon ✨')}
              aria-label="Add to wishlist"
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-rose-500"
            >
              <Heart className="h-4 w-4" />
            </button>
            <AddToCartButton productId={product._id} stock={product.stock} iconOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AICurated({ products }: { products: Product[] }) {
  const curated =
    [...products].sort((a, b) => b.ratingsAverage - a.ratingsAverage).slice(0, 4) ?? [];
  const tags = useTags(products);

  return (
    <section className="container py-16">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 p-px shadow-2xl shadow-teal-300/30">
        <div className="relative grid gap-8 bg-gradient-to-br from-teal-600/95 via-emerald-600/95 to-cyan-600/95 px-6 py-12 sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
              <Bot className="h-4 w-4" /> ShopCart AI
            </div>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Curated for you, by our AI stylist
            </h2>
            <p className="mt-3 max-w-sm text-emerald-50/90">
              We blend your taste with hot trends to surface a tight roster of products worth your
              time — every single day.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  to="/shop"
                  className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  {t}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['from-blue-400 to-indigo-500', 'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500'].map(
                  (g, i) => (
                    <span
                      key={i}
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 border-teal-600 bg-gradient-to-br ${g} text-xs font-bold text-white`}
                    >
                      {['A', 'K', 'M'][i]}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-emerald-50/90">
                <span className="font-bold text-white">2,400+</span> shoppers trust the picks
              </p>
            </div>
          </div>

          <div className="relative grid content-start gap-3 sm:grid-cols-2">
            {curated.length === 0 ? (
              <p className="text-sm text-emerald-50/90">Loading our daily picks…</p>
            ) : (
              curated.map((p) => <CuratedCard key={p._id} product={p} />)
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function useTags(products: Product[]) {
  const fromData = [...new Set(products.flatMap((p) => p.tags ?? []).filter(Boolean))] as string[];
  const list = fromData.length >= 3 ? fromData : fallbackTags;
  return list.slice(0, 5);
}