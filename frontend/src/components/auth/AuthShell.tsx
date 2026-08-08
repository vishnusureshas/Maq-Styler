import { type ReactNode } from 'react';
import { PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="flex min-h-screen w-full bg-white">
      <div className="animate-gradient-pan relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-12 lg:flex xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

        <Link to="/" className="relative inline-flex w-fit items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white shadow-lg backdrop-blur">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">ShopCart</span>
        </Link>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Future-ready shopping
          </span>
          <h2 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Discover styles that
            <br />
            speak for you.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/85">
            Shop the latest trends with lightning-fast delivery, secure payments, and hassle-free
            returns — all in one place.
          </p>
        </div>

        <div className="relative">
          <ul className="space-y-6">
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

          <blockquote className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-md">
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

      <section className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-white to-violet-50/60 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-blob-float absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="animate-blob-float absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl [animation-delay:-6s]" />
        </div>

        <div className="animate-fade-up relative z-10 w-full max-w-md px-6 py-12 sm:px-10">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 lg:hidden"
            aria-label="Back to home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
              <ShoppingBag className="h-5 w-5" />
            </span>
          </Link>
          {children}
        </div>
      </section>
    </div>
  );
}