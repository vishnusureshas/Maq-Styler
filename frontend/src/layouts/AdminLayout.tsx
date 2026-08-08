import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Users,
  PackageSearch,
  BarChart3,
  Store,
  Bell,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, logoutUser } from '@/store/slices/authSlice';
import { LoadingOverlay } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/products', label: 'Products', icon: Boxes, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: PackageSearch, end: false },
  { to: '/admin/sales', label: 'Reports', icon: BarChart3, end: false },
];

const mobileLinks = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
];

function initials(name?: string) {
  return (name ?? 'A')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AdminLayout() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setTransitioning(true);
      const timer = setTimeout(() => setTransitioning(false), 550);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [location.pathname]);

  const logout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const tabLabel = adminLinks.find((l) =>
    l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
  )?.label;

  return (
    <div className="flex min-h-[100dvh] bg-[#F7F9FB] text-foreground">
      {/* ── Sidebar (left) ─────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/80 bg-white lg:flex">
        <Link to="/admin" className="flex h-16 items-center gap-2.5 border-b border-border/70 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Store className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">ShopCart</span>
            <span className="text-xs font-medium text-primary">Admin panel</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Menu
          </p>
          {adminLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <l.icon className="h-[18px] w-[18px]" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/70 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
            <Avatar className="h-9 w-9 bg-primary text-primary-foreground">
              <AvatarFallback className="text-xs">{initials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 leading-tight">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main column ────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top app bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border/80 bg-white/85 px-4 backdrop-blur md:px-6">
          {/* Mobile brand */}
          <Link to="/admin" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">ShopCart</span>
          </Link>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
            <span className="font-medium text-foreground">{tabLabel ?? 'Overview'}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            {/*
              Mobile avatar/logout (sidebar is hidden on small screens)
            */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-1.5 pr-1.5">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                      <AvatarFallback className="text-xs">{initials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/">Return to store</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom nav (mobile) ────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {mobileLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <l.icon className="h-5 w-5" />
              {l.label}
            </NavLink>
          ))}
          <div className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground">
            <Avatar className="h-5 w-5 bg-primary text-primary-foreground">
              <AvatarFallback className="text-[9px]">{initials(user?.name)}</AvatarFallback>
            </Avatar>
            Profile
          </div>
        </div>
      </nav>

      {transitioning && tabLabel && <LoadingOverlay message={`Loading ${tabLabel}…`} />}
    </div>
  );
}