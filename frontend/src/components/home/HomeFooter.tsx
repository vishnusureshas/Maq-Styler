import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Instagram, Twitter, Youtube, Lock } from 'lucide-react';
import { APP_NAME } from '@/config/constants';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'Best Sellers', to: '/shop' },
      { label: 'New Arrivals', to: '/shop' },
      { label: 'Deals', to: '/shop' },
    ],
  },
  {
    title: 'Customer Service',
    links: [
      { label: 'Contact Us', to: '/shop' },
      { label: 'FAQs', to: '/shop' },
      { label: 'Shipping & Returns', to: '/shop' },
      { label: 'Track Order', to: '/my-orders' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/shop' },
      { label: 'Careers', to: '/shop' },
      { label: 'Privacy Policy', to: '/shop' },
      { label: 'Terms & Conditions', to: '/shop' },
    ],
  },
];

const socials = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Youtube, label: 'YouTube' },
];

const payments = ['VISA', 'Mastercard', 'PayPal', 'Apple Pay'];

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">{APP_NAME}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Shop smart, live better. Premium products backed by fast shipping, easy returns and
            secure payments — all in one beautiful store.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600"
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
                  <Link
                    to={l.to}
                    className="text-sm text-slate-500 transition-colors hover:text-violet-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 text-sm text-slate-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-600 shadow-sm"
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
              <Link key={l} to="/shop" className="text-slate-500 transition-colors hover:text-violet-600">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}