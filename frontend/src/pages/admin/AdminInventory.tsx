import { useCallback, useEffect, useState } from 'react';
import { Plus, Minus, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

interface InventoryItem {
  _id: string;
  product: { _id: string; name: string; sku?: string; price?: number };
  sku?: string;
  quantity: number;
  lowStockThreshold: number;
  reserved: number;
}

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<{ _id: string; name: string; stock: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, low] = await Promise.all([adminApi.inventory(), adminApi.lowStock()]);
      setItems(inv.data.inventory ?? []);
      setLowStock(low.data.products ?? []);
    } catch {
      // toast handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track stock levels across products.</p>
        </div>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-rose-700">
            <TriangleAlert className="h-4 w-4" />
            Low stock alert
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span
                key={p._id}
                className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700"
              >
                {p.name} — {p.stock} left
              </span>
            ))}
          </div>
        </div>
      )}

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Quantity</th>
                  <th className="p-4 font-semibold">Threshold</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => (
                  <tr key={inv._id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-4 font-medium">
                      {inv.product?.name ?? '(product)'}
                    </td>
                    <td className="p-4 text-muted-foreground">{inv.sku ?? inv.product?.sku ?? '—'}</td>
                    <td className="p-4">
                      {inv.quantity <= (inv.lowStockThreshold ?? 5) ? (
                        <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                          {inv.quantity}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {inv.quantity}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{inv.lowStockThreshold ?? 5}</td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setAdjusting(inv)}>
                          Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No inventory records. Create a product to generate one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjusting && (
        <AdjustDialog
          item={adjusting}
          onClose={() => setAdjusting(null)}
          onDone={load}
        />
      )}
    </div>
  );
}

function AdjustDialog({
  item,
  onClose,
  onDone,
}: {
  item: InventoryItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [delta, setDelta] = useState<number>(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const apply = async (amount: number) => {
    setSaving(true);
    try {
      await adminApi.adjustInventory(item.product?._id ?? item._id, {
        quantity: amount,
        note,
      });
      toast.success(`Inventory updated by ${amount}`);
      onDone();
      onClose();
    } catch {
      // toast handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust stock — {item.product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Current quantity: <span className="font-semibold text-foreground">{item.quantity}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDelta((d) => d - 1)}
              disabled={saving}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDelta((d) => d + 1)}
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter a negative value to reduce stock, positive to add.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => apply(delta)} disabled={saving || delta === 0}>
              {saving ? 'Saving…' : 'Apply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}