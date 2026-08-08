import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStats, fetchSalesReport, selectAdminStats, selectSalesReport } from '@/store/slices/adminSlice';

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refunded: 'bg-slate-100 text-slate-600',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const initial = (name?: string) =>
  (name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectAdminStats);
  const salesReport = useAppSelector(selectSalesReport);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchSalesReport({}));
  }, [dispatch]);

const recent = stats?.recentOrders ?? [];
  const totalOrders = Number(stats?.totalOrders ?? 0);
  const revenue = Number(stats?.monthlyRevenue ?? 0);
  const avgOrder = totalOrders > 0 ? revenue / totalOrders : 0;

  const chartData = useMemo(() => {
    // Label the last 7 days as an order (Mon–Sun names)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const byDay = new Map(salesReport.map((r) => [r.date.slice(5), r]));
    const start = new Date();
    const labels: { name: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(start.getDate() - i);
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const found = byDay.get(key);
      labels.push({ name: days[d.getDay()], revenue: found?.revenue ?? 0 });
    }
    return labels;
  }, [salesReport]);

  const metricCards = [
    {
      label: 'Revenue',
      value: fmt(revenue),
      icon: DollarSign,
      iconBg: 'bg-blue-50 text-blue-600',
      hint: 'this month',
    },
    {
      label: 'Orders',
      value: String(totalOrders),
      icon: ShoppingCart,
      iconBg: 'bg-emerald-50 text-emerald-600',
      hint: 'all orders',
    },
    {
      label: 'Products',
      value: String(stats?.totalProducts ?? 0),
      icon: Package,
      iconBg: 'bg-violet-50 text-violet-600',
      hint: 'in catalog',
    },
    {
      label: 'Customers',
      value: String(stats?.totalUsers ?? 0),
      icon: Users,
      iconBg: 'bg-amber-50 text-amber-600',
      hint: 'registered',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Heading ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Badge
          variant="outline"
          className="rounded-full border-green-200 bg-green-50 px-3 py-1 text-green-700"
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
          All systems operational
        </Badge>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((c) => (
          <div
            key={c.label}
            className="group rounded-2xl border border-border/80 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg}`}
              >
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight">{c.value}</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <span className="text-xs text-muted-foreground">{c.hint}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + side card ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue overview</h2>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-1 text-xs font-medium">
              <span className="rounded-md bg-white px-2.5 py-1 text-foreground shadow-sm">7d</span>
              <span className="px-2.5 py-1 text-muted-foreground">30d</span>
              <span className="px-2.5 py-1 text-muted-foreground">90d</span>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#EEF2F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  width={44}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                  formatter={(v) => fmt(Number(v))}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick stats / top actions */}
        <div className="rounded-2xl border border-border/80 bg-white p-6">
          <h2 className="font-semibold">Quick overview</h2>
          <div className="mt-4 space-y-3">
            <QuickRow label="Avg. order value" value={fmt(avgOrder)} />
            <QuickRow label="Paid orders" value={String(salesReport.reduce((s, r) => s + r.orders, 0))} />
            <QuickRow label="Recent 7-day revenue" value={fmt(salesReport.reduce((s, r) => s + r.revenue, 0))} />
          </div>
          <div className="mt-4 space-y-2">
            <Button asChild className="w-full">
              <Link to="/admin/products">
                Create product <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/orders">Manage orders</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Recent orders table ── */}
      <div className="rounded-2xl border border-border/80 bg-white">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="font-semibold">Recent orders</h2>
            <p className="text-sm text-muted-foreground">Latest 5 transactions</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/admin/orders">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 pb-8 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => {
                  const name =
                    typeof order.user === 'string' ? order.user : (order.user as { name?: string })?.name;
                  return (
                    <tr key={order._id} className="border-t last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-semibold text-primary">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 bg-slate-100 text-slate-600">
                            <AvatarFallback className="text-xs">{initial(name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                            statusStyles[order.status] ?? 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold">{fmt(order.totalPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}