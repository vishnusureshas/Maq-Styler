import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Star, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rating } from '@/components/shared/Rating';
import { formatCurrency } from '@/lib/formatters';
import type { Category, Product } from '@/types/product';

export function Hero({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const hero =
    [...products].sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0))[0] ?? null;
  const heroImage = hero?.images?.[0];

  const submit = () => {
    const q = query.trim();
    navigate(q ? `/shop?keyword=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/80 via-white to-white">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob-float absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl" />
        <div
          className="animate-blob-float absolute right-0 top-24 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="animate-blob-float absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl"
          style={{ animationDelay: '-12s' }}
        />
        <div
          className="animate-blob-float absolute left-1/2 top-1/2 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI-curated essentials, picked fresh for you
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
            Tomorrow&apos;s
            <br />
            <span className="text-gradient">essentials,</span>
            <br />
            delivered today.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
            Premium tech, everyday essentials and standout designs — all in one beautiful store,
            backed by fast shipping and fuss-free returns.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="glass mt-8 flex max-w-lg items-center gap-2 rounded-full p-1.5"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-blue-600" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for headphones, watches, decor…"
              className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button type="submit" size="sm" className="h-10 rounded-full px-6 text-white">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Popular:</span>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c._id}`}
                className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm text-slate-600 backdrop-blur transition-colors hover:border-blue-300 hover:text-blue-600"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-blue-600/25">
              <Link to="/shop">Explore the store</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-slate-300 bg-white/70 backdrop-blur"
            >
              <Link to="/register">Join free</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-400/30 via-violet-300/30 to-cyan-300/40 blur-2xl" />
          <div className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/40 shadow-2xl shadow-slate-300/50 backdrop-blur-xl">
            {heroImage ? (
              <img
                src={heroImage}
                alt={hero?.name ?? 'Featured product'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                <Zap className="h-16 w-16 text-blue-400/60" />
                <span className="text-lg font-semibold">Featured product</span>
              </div>
            )}

            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI Curated Pick
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 p-3 backdrop-blur">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {hero?.name ?? 'Today’s spotlight'}
                </p>
                {hero && <Rating value={hero.ratingsAverage} count={hero.ratingsQuantity} />}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-bold text-slate-900">
                  {hero ? formatCurrency(hero.price) : '—'}
                </p>
                {hero && (
                  <Link to={`/product/${hero.slug ?? hero._id}`} className="text-xs font-medium text-blue-600 hover:underline">
                    View details
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="animate-float absolute -left-8 top-10 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-xl backdrop-blur">
            <Truck className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Free shipping</p>
              <p className="text-[11px] text-slate-500">On orders over $50</p>
            </div>
          </div>

          <div
            className="animate-float absolute -right-6 bottom-24 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-xl backdrop-blur"
            style={{ animationDelay: '-3s' }}
          >
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs font-semibold text-slate-800">30-day returns</p>
              <p className="text-[11px] text-slate-500">No questions asked</p>
            </div>
          </div>

          <div
            className="animate-float absolute -bottom-6 left-12 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-xl backdrop-blur"
            style={{ animationDelay: '-1.5s' }}
          >
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <p className="text-xs font-semibold text-slate-800">4.9/5 shopper rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}