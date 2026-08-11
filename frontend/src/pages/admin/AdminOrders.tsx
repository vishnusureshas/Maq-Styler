import { useEffect, useState } from 'react';
import { Eye, CheckCircle2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderPayment,
  refundOrder,
  selectAdminOrders,
} from '@/store/slices/adminSlice';
import type { Order, OrderStatus } from '@/types/order';

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const paymentLabels: Record<string, string> = {
  pending: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

const canRefund = (o: Order) =>
  o.paymentStatus !== 'refunded' && o.isPaid && !['cancelled', 'refunded'].includes(o.status);

export default function AdminOrders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectAdminOrders);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(fetchAdminOrders({ status: filter === 'all' ? undefined : (filter as OrderStatus) }));
  }, [dispatch, filter]);

  const onStatusChange = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer orders.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        <div className="p-6 pb-4">
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No orders found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="p-4 font-semibold">Order</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 text-right font-semibold">Total</th>
                    <th className="p-4 text-right font-semibold">View</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-primary">#{order.orderNumber}</td>
                      <td className="p-4">
                        {typeof order.user === 'string'
                          ? order.user
                          : (order.user as { name?: string })?.name ?? '—'}
                        {typeof order.user === 'object' && (
                          <div className="text-xs text-muted-foreground">
                            {String((order.user as { email?: string })?.email ?? '')}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.status}
                          onValueChange={(v) => onStatusChange(order._id, v as OrderStatus)}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue>{statusLabels[order.status]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {statusLabels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            order.paymentStatus === 'refunded'
                              ? 'secondary'
                              : order.isPaid
                                ? 'default'
                                : 'outline'
                          }
                        >
                          {paymentLabels[order.paymentStatus] ??
                            (order.isPaid ? 'Paid' : 'Unpaid')}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-semibold">{fmt(order.totalPrice)}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelected(null)}
          onTogglePaid={() =>
            dispatch(
              updateOrderPayment({
                id: selected._id,
                isPaid: !selected.isPaid,
                paymentStatus: !selected.isPaid ? 'paid' : 'pending',
              })
            ).then(() => setSelected(null))
          }
          onRefund={() =>
            dispatch(refundOrder({ id: selected._id })).then(() => setSelected(null))
          }
          onStatus={(s) => dispatch(updateOrderStatus({ id: selected._id, status: s }))}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onTogglePaid,
  onRefund,
  onStatus,
}: {
  order: Order;
  onClose: () => void;
  onTogglePaid: () => void;
  onRefund: () => void;
  onStatus: (s: OrderStatus) => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                order.paymentStatus === 'refunded'
                  ? 'secondary'
                  : order.isPaid
                    ? 'default'
                    : 'outline'
              }
            >
              {paymentLabels[order.paymentStatus] ?? (order.isPaid ? 'Paid' : 'Unpaid')}
            </Badge>
            <Select value={order.status} onValueChange={(v) => onStatus(v as OrderStatus)}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue>{statusLabels[order.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canRefund(order) && (
              <Button variant="secondary" size="sm" onClick={onRefund}>
                <Undo2 className="mr-2 h-4 w-4" />
                Refund payment
              </Button>
            )}
            {!order.isPaid && (
              <Button variant="outline" size="sm" onClick={onTogglePaid}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as paid
              </Button>
            )}
          </div>

          <div className="rounded border p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {order.shippingAddress?.fullName}
            </p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city} {order.shippingAddress?.state} {order.shippingAddress?.zip}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>

          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1 pr-3">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{fmt(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{fmt(order.shippingPrice)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{fmt(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{fmt(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}