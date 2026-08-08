import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { formatCurrency } from '@/lib/formatters';
import { Reveal } from './Reveal';
import type { Product } from '@/types/product';

export function ArrivalsCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  const inStock = products.filter((p) => p.stock > 0);

  return (
    <section className="bg-gradient-to-b from-transparent via-sky-50/60 to-transparent py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Fresh drops
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              New arrivals
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(-1)} aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(1)} aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {inStock.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            Nothing new yet — check back soon.
          </div>
        ) : (
          <div
            ref={trackRef}
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {inStock.map((p, i) => {
              const image = p.images?.[0];
              const href = `/product/${p.slug ?? p._id}`;
              const compareAt =
                p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : null;
              return (
                <Reveal
                  key={p._id}
                  delay={Math.min(i, 4) * 60}
                  className="w-64 shrink-0 snap-start"
                >
                  <div className="group overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/50">
                    <div className="relative aspect-square overflow-hidden bg-slate-50">
                      <Link to={href}>
                        {image ? (
                          <img
                            src={image}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                            No image
                          </div>
                        )}
                      </Link>
                      {compareAt && (
                        <Badge variant="destructive" className="absolute left-3 top-3 rounded-full px-2.5">
                          Sale
                        </Badge>
                      )}
                      <button
                        onClick={() => toast.info('Wishlist is coming soon ✨')}
                        aria-label="Add to wishlist"
                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <Sparkles className="h-3 w-3" /> New
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-4">
                      <Link to={href} className="line-clamp-1 font-semibold text-slate-800 hover:text-blue-600">
                        {p.name}
                      </Link>
                      <Rating value={p.ratingsAverage} count={p.ratingsQuantity} />
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-900">{formatCurrency(p.price)}</span>
                        {compareAt && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatCurrency(compareAt)}
                          </span>
                        )}
                      </div>
                      <AddToCartButton productId={p._id} stock={p.stock} />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}