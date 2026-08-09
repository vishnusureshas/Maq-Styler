import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Star, Zap, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/shared/Rating';
import { formatCurrency } from '@/lib/formatters';
import type { Category, Product } from '@/types/product';

const avatars = [
  { initial: 'A', className: 'from-violet-500 to-purple-500' },
  { initial: 'K', className: 'from-fuchsia-400 to-pink-500' },
  { initial: 'M', className: 'from-indigo-500 to-violet-500' },
  { initial: 'R', className: 'from-purple-400 to-fuchsia-500' },
];

function HeroVisual({ products }: { products: Product[] }) {
  const slides = products.filter((p) => p.images?.length);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  const validIndex = slides.length > 0 ? index % slides.length : 0;
  const current = slides[validIndex] ?? null;
  const slideKey = current?._id ?? 'placeholder';

  const headphone = slides.find((p) => !current || p._id !== current._id);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-violet-300/40 via-purple-200/30 to-pink-200/50 blur-2xl" />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-violet-100 via-white to-pink-100 shadow-2xl shadow-violet-300/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-purple-300/40 to-pink-300/40 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-violet-300/40 to-fuchsia-200/40 blur-2xl" />
        </div>

        <div className="relative aspect-[4/5] max-h-[560px] w-full">
          {slideKey && (
            <img
              key={slideKey}
              src={current?.images?.[0]}
              alt={current?.name}
              className="animate-hero-slide absolute inset-0 h-full w-full object-cover"
            />
          )}
          {!slideKey && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid place-items-center gap-3 text-slate-400">
                <Zap className="h-16 w-16 text-violet-300" />
                <span className="text-lg font-semibold">Featured products</span>
              </div>
            </div>
          )}

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg shadow-violet-900/10 backdrop-blur">
            <Tag className="h-4 w-4 text-rose-500" />
            <p>
              <span className="text-xs font-bold text-rose-500">Big Sale</span>
              <span className="text-xs font-semibold text-slate-700"> — Up to 50% Off</span>
            </p>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 shadow-xl shadow-violet-900/10 backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">
                {current?.name ?? 'Premium products'}
              </p>
              {current && <Rating value={current.ratingsAverage} count={current.ratingsQuantity} />}
              <p className="mt-0.5 text-base font-extrabold text-violet-600">
                {current ? formatCurrency(current.price) : '—'}
              </p>
            </div>
            <Button asChild size="sm" className="h-9 shrink-0 rounded-full px-5">
              <Link to={current ? `/product/${current.slug ?? current._id}` : '/shop'}>
                Shop <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-24 right-5 z-10 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/70 bg-white/90 shadow-sm backdrop-blur"
            onClick={() => setIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0))}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/70 bg-white/90 shadow-sm backdrop-blur"
            onClick={() => setIndex((i) => (i + 1) % (slides.length || 1))}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {headphone && (
        <div className="animate-float absolute -right-4 -top-6 hidden w-44 overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-xl shadow-violet-900/10 backdrop-blur sm:block">
          <div className="flex items-center gap-2.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-violet-50">
              <img src={headphone.images?.[0]} alt={headphone.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{headphone.name}</p>
              <p className="text-xs font-extrabold text-violet-600">{formatCurrency(headphone.price)}</p>
            </div>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <div
          className="animate-float absolute -bottom-6 -left-4 hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-xl shadow-violet-900/10 backdrop-blur sm:flex"
          style={{ animationDelay: '-2s' }}
        >
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <div>
            <p className="text-xs font-bold text-slate-800">4.9/5 rated</p>
            <p className="text-[11px] text-slate-500">12k+ verified reviews</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Hero({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  void categories;
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-violet-100/70 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-fuchsia-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            <Sparkles className="h-4 w-4" /> New arrivals
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
            Shop smart.
            <br />
            <span className="text-gradient-pink">Live better.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
            Discover top-quality products at the best prices. Trendy, reliable &amp; just for
            you.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-9 shadow-xl shadow-violet-500/30 transition-transform duration-300 hover:scale-[1.03]">
              <Link to="/shop">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-9 text-slate-700 shadow-sm transition-all duration-300 hover:border-violet-300 hover:text-violet-600"
            >
              <Link to="/shop">Explore Deals</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <span
                  key={a.initial}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${a.className} text-xs font-bold text-white shadow-sm`}
                >
                  {a.initial}
                </span>
              ))}
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                50,000+ happy shoppers
              </p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                4.9/5 from 12,000+ reviews
              </p>
            </div>
          </div>
        </div>

        <HeroVisual products={products} />
      </div>
    </section>
  );
}