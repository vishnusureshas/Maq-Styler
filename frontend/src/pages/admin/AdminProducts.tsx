import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productApi } from '@/api/product';
import { fetchCategories, selectCategories } from '@/store/slices/categorySlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Product } from '@/types/product';
import { toast } from 'sonner';

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const productSchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().min(5, 'Description required'),
  brand: z.string().optional(),
  price: z.coerce.number().min(0, 'Invalid price'),
  compareAtPrice: z.coerce.number().optional().or(z.literal('')),
  category: z.string().min(1, 'Category required'),
  stock: z.coerce.number().min(0),
  sku: z.string().optional(),
  image: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productApi.list({ page: 1, pageSize: 100 });
      setProducts(data.products);
    } catch {
      // toast handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    dispatch(fetchCategories());
  }, [load, dispatch]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDialogOpen(true);
  };

  const close = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const onDelete = async (id: string) => {
    try {
      await productApi.remove(id);
      toast.success('Product deleted');
      load();
    } catch {
      // toast handled
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products in catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New product
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {typeof p.category === 'string'
                        ? p.category
                        : (p.category as { name?: string })?.name ?? '—'}
                    </td>
                    <td className="p-4 font-medium">{fmt(p.price)}</td>
                    <td className="p-4">
                      {p.stock <= 10 ? (
                        <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                          {p.stock}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(p._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialogOpen && (
        <ProductFormDialog
          product={editing}
          categories={categories}
          onClose={close}
          onSaved={() => {
            close();
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductFormDialog({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: { _id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      brand: product?.brand ?? '',
      price: product?.price ?? 0,
      compareAtPrice: product?.compareAtPrice ?? '',
      category: typeof product?.category === 'string' ? product.category : (product?.category as { _id?: string })?._id ?? '',
      stock: product?.stock ?? 0,
      sku: product?.sku ?? '',
      image: product?.images?.[0] ?? '',
      isFeatured: product?.isFeatured ?? false,
    },
  });

  const onSubmit = async (values: ProductForm) => {
    setSaving(true);
    try {
      let urls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        const { data } = await productApi.uploadImages(files);
        urls = data.urls || [];
        setUploading(false);
      }
      const images = [...urls, ...(values.image ? values.image.split(',').map((s) => s.trim()).filter(Boolean) : [])];
      const payload = {
        name: values.name,
        description: values.description,
        brand: values.brand || undefined,
        price: values.price,
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
        category: values.category,
        stock: values.stock,
        sku: values.sku || undefined,
        images,
        isFeatured: Boolean(values.isFeatured),
      };
      if (product) {
        await productApi.update(product._id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      onSaved();
    } catch {
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'New product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input {...register('brand')} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
                defaultValue={product && (typeof product.category === 'string' ? product.category : (product.category as { _id?: string })?._id) || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Compare-at price</Label>
              <Input type="number" step="0.01" {...register('compareAtPrice')} />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" {...register('stock')} />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register('sku')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Images (upload up to 5)</Label>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={files.length >= 5}
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []).slice(0, 5 - files.length);
                setFiles((prev) => [...prev, ...selected]);
                e.target.value = '';
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
            />
            {files.length >= 5 && (
              <p className="text-xs text-destructive">Maximum 5 images reached. Remove some first.</p>
            )}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-16 w-16 rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Image URL(s)</Label>
            <Input placeholder="https://…  (comma-separated for multiple)" {...register('image')} />
          </div>
          <div className="flex items-center gap-2">
            <input id="featured" type="checkbox" {...register('isFeatured')} className="h-4 w-4" />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured product
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {uploading ? 'Uploading…' : saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}