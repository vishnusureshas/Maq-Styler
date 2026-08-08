import { type ReactNode } from 'react';
import { PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Star } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Curated collections',
    description: 'Hand-picked styles refreshed every week.',
  },
  {
    icon: PackageCheck,
    title: 'Fast, secure checkout',
    description: 'Stripe-powered payments in just one click.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected purchases',
    description: 'Buyer protection on every single order.',
  },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-7.5rem)] items-center justify-center overflow-hidden py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-float absolute -left-24 top-8 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="animate-blob-float absolute top-1/3 -right-10 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl [animation-delay:2s]" />
        <div className="animate-blob-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl [animation-delay:4s]" />
      </div>

      <div className="container relative z-10 flex items-center justify-center">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl lg:grid-cols-2">
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className="animate-fade-up w-full max-w-md">{children}</div>
          </div>

          <div className="animate-gradient-pan relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-10 text-white lg:flex lg:p-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <ShoppingBag className="h-3.5 w-3.5" />
                ShopCart Store
              </span>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white">
                Discover styles that
                <br />
                speak for you.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
                Shop the latest trends in fashion with lightning-fast delivery, secure payments,
                and hassle-free returns — all in one place.
              </p>
            </div>

            <ul className="relative mt-12 space-y-6">
              {features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-0.5 text-sm text-white/75">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <blockquote className="relative mt-12 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-md">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                “Checkout was seamless and my order arrived in two days. This is my go-to store
                now.”
              </p>
              <footer className="mt-3 text-sm font-medium text-white/80">
                — Priya S., Verified buyer
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}