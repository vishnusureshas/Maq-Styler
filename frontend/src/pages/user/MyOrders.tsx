import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMyOrders,
  fetchOrderById,
  cancelOrder,
  returnOrder,
  resetOrder,
  selectCurrentOrder,
} from '@/store/slices/orderSlice';
import type { Order } from '@/types/order';

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  delivered: 'default',
  processing: 'secondary',
  shipped: 'secondary',
  cancelled: 'destructive',
  refunded: 'destructive',
  pending: 'outline',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function MyOrders() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orders = useAppSelector((s) => s.order.orders);
  const current = useAppSelector(selectCurrentOrder);
  const status = useAppSelector((s) => s.order.status);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId) dispatch(fetchOrderById(orderId));
  }, [dispatch, searchParams]);

  const created = searchParams.get('created');

  if (status === 'loading' && orders.length === 0)
    return <div className="container py-16 text-center text-muted-foreground">Loading orders…</div>;

  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>
      <h1 className="mb-6 text-2xl font-bold">My orders</h1>

      {created && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Order placed successfully! Order #{created}</p>
        </div>
      )}

      {current && (
        <OrderDetailDialog
          order={current}
          onClose={() => {
            dispatch(resetOrder());
            navigate('/my-orders');
          }}
          onCancel={() => dispatch(cancelOrder(current._id))}
          onReturn={() => dispatch(returnOrder(current._id))}
        />
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild>
            <Link to="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <button
              key={order._id}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/my-orders?order=${order._id}`);
              }}
              className="w-full rounded-lg border p-5 text-left transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Order #{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusVariant[order.status] ?? 'outline'}>
                  {statusLabels[order.status] ?? order.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
                <span className="font-semibold">{fmt(order.totalPrice)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetailDialog({
  order,
  onClose,
  onCancel,
  onReturn,
}: {
  order: Order;
  onClose: () => void;
  onCancel: () => void;
  onReturn: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={statusVariant[order.status] ?? 'outline'}>
              {statusLabels[order.status] ?? order.status}
            </Badge>
            {['pending', 'processing', 'shipped'].includes(order.status) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onCancel();
                  onClose();
                }}
              >
                Cancel order
              </Button>
            )}
            {['delivered', 'shipped'].includes(order.status) && order.status !== 'refunded' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onReturn();
                  onClose();
                }}
              >
                Request return
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="rounded border p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Shipping to {order.shippingAddress?.fullName}</p>
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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="capitalize">{order.paymentMethod} · {order.isPaid ? 'Paid' : 'Unpaid'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}