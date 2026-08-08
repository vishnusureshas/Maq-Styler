import { Link, Outlet, NavLink, useLocation } from 'react-router-dom';
import { User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { selectUser } from '@/store/slices/authSlice';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
];

export function PublicLayout() {
  const user = useAppSelector(selectUser);
  const { pathname } = useLocation();
  const isChromeHidden =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email');

  return (
    <div className="flex min-h-screen flex-col">
      {!isChromeHidden && (
        <>
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            ShopCart
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    isActive ? 'bg-accent text-accent-foreground' : ''
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
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
              <Button asChild size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
        </header>
      </>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isChromeHidden && (
        <footer className="border-t">
          <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} ShopCart</span>
            <span>Built with React + Redux Toolkit</span>
          </div>
        </footer>
      )}
    </div>
  );
}