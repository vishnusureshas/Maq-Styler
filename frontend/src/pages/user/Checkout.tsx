import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, CreditCard, MapPin, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart, selectCart } from '@/store/slices/cartSlice';
import { createOrder, selectCurrentOrder } from '@/store/slices/orderSlice';
import { StripeCardForm } from '@/components/payment/StripeCardForm';
import { productImage, productName } from './Cart';
import type { Order } from '@/types/order';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  address: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().min(2, 'Country required'),
  phone: z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;
type Step = 'address' | 'payment' | 'review';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const steps: { id: Step; label: string }[] = [
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export default function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector(selectCart);
  const order = useAppSelector(selectCurrentOrder);
  const [step, setStep] = useState<Step>('address');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (order) {
      setPlacedOrder(order);
      setStep('review');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  useEffect(() => {
    dispatch(fetchCart()).finally(() => setLoading(false));
  }, [dispatch]);

  if (loading)
    return <div className="container py-16 text-center text-muted-foreground">Loading checkout…</div>;

  const items = cart?.items ?? [];
  const shipping = (cart?.totalPrice ?? 0) >= 50 ? 0 : 9.99;
  const total = (cart?.totalPrice ?? 0) + shipping;

  const goToPayment = async () => {
    const valid = await trigger();
    if (valid) setStep('payment');
  };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const values = getValues();
      const res = await dispatch(
        createOrder({ shippingAddress: values, paymentMethod })
      ).unwrap();
      // createOrder.fulfilled sets `current` → triggers effect above
      if (paymentMethod === 'cod') {
        navigate(`/my-orders?created=${res.orderNumber}`);
      }
      // for card, keep on review to show StripeCardForm
    } catch {
      // toast handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < stepIndex && setStep(s.id)}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                step === s.id
                  ? 'bg-primary text-primary-foreground'
                  : i < stepIndex
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : `${i + 1}.`}
              {s.label}
            </button>
            {i < steps.length - 1 && <Separator className="w-6" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* STEP 1: Address */}
          {step === 'address' && (
            <form onSubmit={(e) => { e.preventDefault(); goToPayment(); }} className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping address
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Full name</Label>
                  <Input placeholder="Jane Doe" {...register('fullName')} />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Street address</Label>
                  <Input placeholder="123 Main St" {...register('address')} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="New York" {...register('city')} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input placeholder="NY" {...register('state')} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP / Postal code</Label>
                  <Input placeholder="10001" {...register('zip')} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input placeholder="United States" {...register('country')} />
                  {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Phone (optional)</Label>
                  <Input placeholder="+1 555 000 0000" {...register('phone')} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="lg" className="min-w-36">
                  Continue to payment
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment */}
          {step === 'payment' && (
            <div className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Banknote className="h-5 w-5 text-primary" />
                Payment method
              </div>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'card' | 'cod')}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="ml-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="card" className="font-medium">Credit / Debit Card</Label>
                    <p className="text-sm text-muted-foreground">Pay securely with Stripe</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="cod" id="cod" />
                  <Banknote className="ml-1 h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="cod" className="font-medium">Cash on Delivery</Label>
                </div>
              </RadioGroup>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep('address')}>
                  Back
                </Button>
                <Button size="lg" className="min-w-36" onClick={() => setStep('review')}>
                  Continue to review
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review + place order */}
          {step === 'review' && (
            <div className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Review & pay
              </div>

              <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ship to</p>
                  <p className="font-medium">{getValues('fullName')}</p>
                  <p className="text-muted-foreground">{getValues('address')}</p>
                  <p className="text-muted-foreground">{getValues('city')} {getValues('state')} {getValues('zip')}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Pay via</p>
                  <p className="font-medium capitalize">{paymentMethod}</p>
                </div>
              </div>

              {placedOrder && paymentMethod === 'card' ? (
                <StripeCardForm
                  order={placedOrder}
                  onSuccess={() => navigate(`/my-orders?created=${placedOrder.orderNumber}`)}
                />
              ) : (
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep('payment')}>
                    Back
                  </Button>
                  <Button size="lg" className="min-w-48" onClick={placeOrder} disabled={submitting}>
                    {submitting ? 'Placing order…' : `Place order · ${fmt(total)}`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Your order</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={String((item.product as { _id?: string })._id ?? item.product)} className="flex gap-3">
                  <img src={productImage(item.product)} alt="" className="h-14 w-14 rounded object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{productName(item.product)}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{fmt((item.priceAtAdd ?? 0) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{fmt(cart?.totalPrice ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : fmt(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{fmt(cart?.totalDiscount ?? 0)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              By placing this order you agree to our{' '}
              <Link to="/terms" className="underline">terms</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}