import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  ChevronDown,
  LayoutDashboard,
  User,
  Store,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WishlistDrawer } from '@/components/wishlist/WishlistDrawer';
import { AnnouncementBar } from './AnnouncementBar';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { selectCategories } from '@/store/slices/categorySlice';
import { APP_NAME } from '@/config/constants';

export function Navbar() {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const categories = useAppSelector(selectCategories);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (q: string) => {
    const keyword = q.trim();
    if (!keyword) return;
    setQuery('');
    setMobileOpen(false);
    navigate(`/shop?keyword=${encodeURIComponent(keyword)}`);
  };

  const navItem = 'text-sm font-medium text-slate-600 transition-colors hover:text-violet-600';
  const accountHref = user ? (user.role === 'admin' ? '/admin' : '/profile') : '/login';
  const AccountIcon = user && user.role === 'admin' ? LayoutDashboard : User;

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div className="border-b border-slate-100 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="flex items-center gap-1">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 text-white">
                        <ShoppingBag className="h-4 w-4" />
                      </span>
                      {APP_NAME}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-1 px-1">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitSearch(query);
                      }}
                      className="relative mb-4"
                    >
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products…"
                        className="rounded-full pl-9"
                      />
                    </form>
                    <Link
                      to="/"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-violet-600"
                    >
                      <Sparkles className="h-4 w-4" /> Home
                    </Link>
                    <Link
                      to="/shop"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-accent"
                    >
                      <Store className="h-4 w-4" /> Shop
                    </Link>
                    <Link
                      to="/shop"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-accent"
                    >
                      <Sparkles className="h-4 w-4" /> New Arrivals
                    </Link>
                    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Categories
                    </p>
                    <Link
                      to="/shop"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-accent"
                    >
                      All products
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        to={`/shop?category=${c._id}`}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-accent"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              <Link to="/" className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 transition-transform duration-300 hover:scale-105">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {APP_NAME}
                </span>
              </Link>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link
                to="/"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-violet-600"
              >
                Home
              </Link>
              <Link to="/shop" className={navItem + ' rounded-lg px-3.5 py-2'}>
                Shop
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={navItem + ' flex items-center gap-1 rounded-lg px-3.5 py-2'}
                >
                  Categories <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Shop by category</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/shop">
                      <Store className="h-4 w-4" /> All products
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.slice(0, 8).map((c) => (
                    <DropdownMenuItem key={c._id} asChild>
                      <Link to={`/shop?category=${c._id}`}>{c.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/shop" className={navItem + ' rounded-lg px-3.5 py-2'}>
                Deals
              </Link>
              <Link to="/shop" className={navItem + ' rounded-lg px-3.5 py-2'}>
                New Arrivals
              </Link>
            </nav>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch(query);
              }}
              className="group relative"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more…"
                className="h-11 rounded-full border-slate-200 bg-slate-50 pl-11 transition-all duration-300 focus:border-violet-300 focus:bg-white"
              />
            </form>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:hidden"
              onClick={() => navigate('/shop')}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <WishlistDrawer />
            <CartDrawer />

            <Button variant="ghost" size="icon" asChild aria-label="Account">
              <Link to={accountHref}>
                <AccountIcon className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}