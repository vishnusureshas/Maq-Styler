import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';

export function AddToCartButton({
  productId,
  stock,
  variant,
  quantity = 1,
}: {
  productId: string;
  stock: number;
  variant?: Record<string, string>;
  quantity?: number;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const token = useAppSelector((s) => s.auth.token);

  const handleAdd = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await dispatch(addToCart({ productId, quantity, variant })).unwrap();
      toast.success('Added to cart');
    } catch {
      // error toast handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleAdd} disabled={loading || stock <= 0} className="w-full">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {stock <= 0 ? 'Out of Stock' : loading ? 'Adding…' : 'Add to Cart'}
    </Button>
  );
}