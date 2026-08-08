import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Instagram, Twitter, Youtube, Lock } from 'lucide-react';
import { APP_NAME } from '@/config/constants';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/shop' },
      { label: 'New arrivals', to: '/shop' },
      { label: 'Best sellers', to: '/shop' },
      { label: 'Sale', to: '/shop' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'My orders', to: '/my-orders' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping info', to: '/shop' },
      { label: 'Returns & refunds', to: '/shop' },
      { label: 'Payment methods', to: '/shop' },
      { label: 'Contact us', to: '/shop' },
    ],
  },
];

const socials = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Youtube, label: 'YouTube' },
];

const payments = ['VISA', 'Mastercard', 'PayPal', 'Apple Pay', 'G Pay'];

export function HomeFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/60 bg-gradient-to-br from-slate-50 via-white to-sky-50/70">
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="container relative grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 text-white">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">{APP_NAME}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Tomorrow&apos;s essentials, delivered today. Premium products backed by fast shipping
            and 30-day returns.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-slate-500 transition-colors hover:text-blue-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200/70">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-sm text-slate-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600"
              >
                {p}
              </span>
            ))}
            <span className="ml-1 flex items-center gap-1 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5" /> Secure checkout
            </span>
          </div>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <Link key={l} to="/shop" className="hover:text-blue-600">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}