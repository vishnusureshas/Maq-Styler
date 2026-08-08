import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  ChevronDown,
  LayoutDashboard,
  User,
  Store,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
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
    navigate(keyword ? `/shop?keyword=${encodeURIComponent(keyword)}` : '/shop');
    setQuery('');
    setMobileOpen(false);
  };

  const wishlistComingSoon = () => toast.info('Wishlist is coming soon ✨');

  const navItem =
    'text-sm font-medium text-slate-600 transition-colors hover:text-primary';

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">{APP_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-primary"
            >
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={navItem + ' flex items-center gap-1 rounded-lg px-3 py-2'}>
                Shop <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Browse store</DropdownMenuLabel>
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

            <Link to="/shop?category=" className={navItem + ' rounded-lg px-3 py-2'}>
              Deals
            </Link>
          </nav>
        </div>

        <div className="hidden max-w-md flex-1 md:block">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(query);
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="rounded-full border-white/70 bg-white/80 pl-9 shadow-sm backdrop-blur"
            />
          </form>
        </div>

        <div className="flex items-center gap-1.5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
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
                    className="pl-9"
                  />
                </form>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary"
                >
                  <Sparkles className="h-4 w-4" /> Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-accent"
                >
                  <Store className="h-4 w-4" /> All products
                </Link>
                <div className="pl-7">
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
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate('/shop')}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={wishlistComingSoon}
            aria-label="Wishlist"
            className="relative"
          >
            <Heart className="h-5 w-5" />
          </Button>

          <CartDrawer />

          {user ? (
            user.role === 'admin' ? (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/admin" aria-label="Admin">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile" aria-label="Profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
