import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Sparkle,
  Star,
  Tag,
  Truck,
  Watch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/home/Reveal';
import type { Category, Product } from '@/types/product';

const avatars = [
  { initial: 'A', className: 'from-violet-500 to-purple-500' },
  { initial: 'K', className: 'from-fuchsia-400 to-pink-500' },
  { initial: 'M', className: 'from-indigo-500 to-violet-500' },
  { initial: 'R', className: 'from-purple-400 to-fuchsia-500' },
];

function Plant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 120" className={className} aria-hidden="true">
      <ellipse cx="45" cy="116" rx="30" ry="6" fill="rgba(124,58,237,0.10)" />
      <path d="M27 112h36l-5-24H32z" fill="#fbcfe8" />
      <rect x="31" y="86" width="28" height="6" rx="3" fill="#f9a8d4" opacity="0.85" />
      <path d="M45 88 L44 40" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="45" cy="34" rx="6" ry="12" fill="#4ade80" transform="rotate(8 45 34)" />
      <ellipse cx="32" cy="48" rx="5" ry="10" fill="#22c55e" transform="rotate(38 32 48)" />
      <ellipse cx="58" cy="48" rx="5" ry="10" fill="#4ade80" transform="rotate(-38 58 48)" />
      <ellipse cx="38" cy="62" rx="4" ry="9" fill="#16a34a" transform="rotate(18 38 62)" />
      <ellipse cx="52" cy="62" rx="4" ry="9" fill="#22c55e" transform="rotate(-18 52 62)" />
    </svg>
  );
}

function HeroVisual({ products }: { products: Product[] }) {
  const watchProducts = products.filter(
    (p) => /watch|band|fitness|smart ?wearable/i.test(p.name) && p.images?.length
  );
  const slides = (watchProducts.length > 0 ? watchProducts : products.filter((p) => p.images?.length)).slice(0, 4);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides.length > 0 ? slides[index % slides.length] : null;
  const watchImage = current?.images?.[0];
  const watchKey = current?._id ?? 'placeholder';

  const headphones =
    products.find((p) => /headphone|earbud|earphone|airpod|headset|audio/i.test(p.name) && p.images?.length) ?? null;
  const headImage = headphones?.images?.[0];

  const go = (dir: 1 | -1) => {
    if (slides.length === 0) return;
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative isolate aspect-[4/5] w-full overflow-visible">
        {/* Soft abstract background — white, lavender, purple, pink, subtle blue glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fdfbff] via-[#f6f0fe] to-white" />
          <div
            className="animate-blob-float absolute -left-10 top-[6%] h-56 w-56 rounded-full bg-violet-200/70 blur-3xl sm:h-72 sm:w-72"
            style={{ animationDuration: '20s' }}
          />
          <div
            className="animate-blob-float absolute -right-8 top-[30%] h-48 w-48 rounded-full bg-fuchsia-200/60 blur-3xl sm:h-64 sm:w-64"
            style={{ animationDuration: '26s', animationDelay: '-4s' }}
          />
          <div
            className="animate-blob-float absolute left-[24%] top-[58%] h-52 w-52 rounded-full bg-pink-200/60 blur-3xl sm:h-64 sm:w-64"
            style={{ animationDuration: '23s', animationDelay: '-8s' }}
          />
          <div
            className="animate-blob-float absolute -bottom-6 left-[10%] h-44 w-44 rounded-full bg-indigo-200/60 blur-3xl sm:h-56 sm:w-56"
            style={{ animationDuration: '28s', animationDelay: '-2s' }}
          />
          <div
            className="animate-blob-float absolute right-[14%] top-2 h-36 w-36 rounded-full bg-sky-200/40 blur-3xl"
            style={{ animationDuration: '24s', animationDelay: '-6s' }}
          />
        </div>

        {/* Slow-spinning decorative orbit rings around the product */}
        <div className="pointer-events-none absolute left-1/2 top-[46%] -z-[5] h-[116%] w-[116%] -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin-slow h-full w-full rounded-full border border-dashed border-violet-300/40" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[46%] -z-[5] h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2">
          <div
            className="animate-spin-slow h-full w-full rounded-full border border-fuchsia-200/50"
            style={{ animationDirection: 'reverse', animationDuration: '38s' }}
          />
        </div>

        {/* Twinkling sparkles */}
        <span className="animate-sparkle absolute left-[10%] top-[16%] z-[6] text-violet-400">
          <Sparkle className="h-4 w-4" />
        </span>
        <span className="animate-sparkle absolute right-[7%] top-[6%] z-[6] text-fuchsia-400" style={{ animationDelay: '1.4s' }}>
          <Sparkle className="h-3 w-3" />
        </span>
        <span className="animate-sparkle absolute right-[12%] bottom-[18%] z-[6] text-pink-400" style={{ animationDelay: '2.4s' }}>
          <Sparkle className="h-5 w-5" />
        </span>

        {/* Soft platform / pedestal beneath the products */}
        <div className="pointer-events-none absolute bottom-[7%] left-1/2 z-0 h-16 w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_62%)]" />

        {/* Plant — behind, on the left */}
        <div className="absolute bottom-[8%] left-[2%] z-[5] -rotate-3">
          <Plant className="w-24 drop-shadow-[0_10px_14px_rgba(76,29,149,0.18)] sm:w-32" />
        </div>

        {/* Wireless headphones — behind/right */}
        <div className="absolute right-[1%] top-[12%] z-10 w-44 rotate-6 sm:w-60 lg:w-64">
          <div className="relative h-full w-full">
            <div className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full bg-white/70 blur-2xl" />
            {headImage ? (
              <img
                src={headImage}
                alt={headphones?.name ?? 'Wireless headphones'}
                className="animate-float h-full w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="grid h-full min-h-[10rem] w-full place-items-center">
                <span className="grid h-24 w-24 place-items-center rounded-full border border-violet-200/70 bg-white/80 text-violet-400 shadow-xl shadow-violet-200/50">
                  <Headphones className="h-10 w-10" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Smartwatch — primary foreground object */}
        <div className="absolute left-1/2 top-1/2 z-20 w-[72%] -translate-x-1/2 -translate-y-1/2 sm:w-[66%]">
          {watchImage ? (
            <div className="relative">
              <img
                key={watchKey}
                src={watchImage}
                alt={current?.name ?? 'Smartwatch'}
                className="animate-hero-slide mx-auto h-auto max-h-[26rem] w-full object-contain mix-blend-multiply"
              />
            </div>
          ) : (
            <div className="grid aspect-square w-full place-items-center">
              <span className="grid h-36 w-36 place-items-center rounded-full border border-violet-200/70 bg-white/80 text-violet-400 shadow-xl shadow-violet-500/30 sm:h-44 sm:w-44">
                <Watch className="h-16 w-16 sm:h-20 sm:w-20" />
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-6 bottom-2 -z-10 h-6 rounded-full bg-purple-300/30 blur-xl" />
        </div>

        {/* Sale badge — floating, upper right (upper left on mobile) */}
        <div className="animate-float absolute right-auto left-3 top-3 z-30 sm:left-auto sm:right-5 sm:top-6">
          <div className="relative flex items-center gap-2.5 rounded-2xl rounded-br-md bg-white/95 px-4 py-3 shadow-xl shadow-purple-900/15 ring-1 ring-black/[0.03]">
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30">
              <span className="animate-ring-pulse absolute inset-0 rounded-full bg-purple-400/70" />
              <Tag className="relative h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-slate-900">Big Sale</p>
              <p className="text-xs font-semibold text-violet-600">Up to 50% Off</p>
            </div>
          </div>
        </div>

        {/* Floating glass chips */}
        <div
          className="animate-float absolute left-0 top-[40%] z-30 hidden sm:block"
          style={{ animationDuration: '7s' }}
        >
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-purple-900/10 backdrop-blur-md">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30">
              <Truck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-extrabold text-slate-900">Free Shipping</p>
              <p className="text-[11px] font-semibold text-slate-500">On orders $100+</p>
            </div>
          </div>
        </div>

        <div
          className="animate-float absolute -bottom-1 left-[4%] z-30"
          style={{ animationDuration: '8s', animationDelay: '-2.5s' }}
        >
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-purple-900/10 backdrop-blur-md">
            <span className="text-sm font-extrabold text-slate-900">4.8</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">12K reviews</span>
          </div>
        </div>

        <div
          className="animate-float absolute right-0 top-[44%] z-30 hidden md:block"
          style={{ animationDuration: '7.5s', animationDelay: '-3.5s' }}
        >
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-xl shadow-purple-900/10 backdrop-blur-md">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-extrabold text-slate-900">30-Day Returns</p>
              <p className="text-[11px] font-semibold text-slate-500">Worry-free shopping</p>
            </div>
          </div>
        </div>

        {/* Carousel indicators */}
        {slides.length > 0 && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-7">
            {slides.map((s, i) => (
              <button
                key={s._id}
                type="button"
                aria-label={`Go to product ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === index % slides.length ? 'w-6 bg-violet-600 shadow-sm shadow-violet-400/50' : 'w-2 bg-slate-300 hover:bg-violet-300'
                )}
              />
            ))}
          </div>
        )}

        {/* Carousel controls — bottom right */}
        <div className="absolute bottom-3 right-3 z-30 flex gap-2 sm:bottom-5 sm:right-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous product"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-lg shadow-purple-900/10 transition-all duration-200 hover:scale-110 hover:text-violet-600 hover:shadow-violet-300/40 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next product"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-white text-slate-600 shadow-lg shadow-purple-900/10 transition-all duration-200 hover:scale-110 hover:text-violet-600 hover:shadow-violet-300/40 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
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
        <div className="absolute right-[8%] top-0 h-96 w-96 rounded-full bg-fuchsia-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        {/* LEFT — 45% marketing content */}
        <div className="lg:col-span-5">
          <span
            className="animate-fade-up inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.22em] text-violet-600"
            style={{ animationDelay: '0.05s' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <span className="mr-2 h-px w-8 bg-violet-400" />
            New arrivals
          </span>

          <h1
            className="animate-fade-up mt-6 text-5xl font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl xl:text-[4.5rem]"
            style={{ animationDelay: '0.15s' }}
          >
            Shop Smart.
            <br />
            <span className="text-gradient-animated">Live Better.</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-md text-lg leading-relaxed text-slate-500"
            style={{ animationDelay: '0.25s' }}
          >
            Discover top-quality products at the best prices.
            <br />
            Trendy, reliable &amp; just for you.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '0.35s' }}
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 px-9 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-500/40"
            >
              <Link to="/shop">
                <span className="pointer-events-none absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
                <span className="relative inline-flex items-center gap-2">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-9 text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600 hover:shadow-md hover:shadow-violet-200/50"
            >
              <Link to="/shop">Explore Deals</Link>
            </Button>
          </div>

          <div
            className="animate-fade-up mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: '0.45s' }}
          >
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <span
                  key={a.initial}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${a.className} text-xs font-bold text-white shadow-md`}
                >
                  {a.initial}
                </span>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                <AnimatedCounter to={50000} suffix="+" /> happy shoppers
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span className="font-semibold text-slate-700">4.8</span> (12K Reviews)
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — 55% floating product showcase */}
        <div className="animate-fade-up lg:col-span-7" style={{ animationDelay: '0.2s' }}>
          <HeroVisual products={products} />
        </div>
      </div>
    </section>
  );
}