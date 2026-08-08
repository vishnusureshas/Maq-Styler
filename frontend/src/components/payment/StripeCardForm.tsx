import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { paymentApi, getStripeEnvKey } from '@/api/payment';
import type { Order } from '@/types/order';

export function StripeCardForm({
  order,
  onSuccess,
}: {
  order: Order;
  onSuccess: () => void;
}) {
  const key = getStripeEnvKey();
  if (!key || key.includes('xxx')) {
    return <StripeUnavailable onProceed={onSuccess} />;
  }

  return <StripeCardContent order={order} onSuccess={onSuccess} publishable={key} />;
}

function StripeCardContent({
  order,
  onSuccess,
  publishable,
}: {
  order: Order;
  onSuccess: () => void;
  publishable: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripePromise] = useState<Promise<Stripe | null>>(() => loadStripe(publishable));

  useEffect(() => {
    let active = true;
    paymentApi
      .createIntent(order._id)
      .then((res) => {
        if (active) setClientSecret(res.data.clientSecret);
      })
      .catch(() => {
        if (active) setError('Could not initialize payment. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [order._id]);

  if (loading) {
    return <Button className="w-full" disabled>Preparing secure checkout…</Button>;
  }

  if (error || !clientSecret) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error ?? 'Payment couldn&apos;t be initialized.'}
        </div>
        <Button className="w-full" onClick={onSuccess} size="lg">
          Continue to order without online payment
        </Button>
      </div>
    );
  }

const options = { clientSecret };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PayForm order={order} onSuccess={onSuccess} />
    </Elements>
  );
}

function PayForm({
  order,
  onSuccess,
}: {
  order: Order;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { return_url: window.location.origin + '/my-orders' },
    });

    if (result.error) {
      setError(result.error.message ?? 'Payment failed. Please try again.');
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={!stripe || processing} size="lg">
        {processing ? 'Processing…' : `Pay ${fmt(order.totalPrice)}`}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Powered by Stripe. Your card is processed securely.
      </p>
    </form>
  );
}

function StripeUnavailable({ onProceed }: { onProceed: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Online card payment (Stripe) isn&apos;t configured yet — set{' '}
        <code className="rounded bg-amber-100 px-1">VITE_STRIPE_PUBLISHABLE</code> in{' '}
        <code className="rounded bg-amber-100 px-1">frontend/.env</code>. You can still place the
        order.
      </div>
      <Button className="w-full" size="lg" onClick={onProceed}>
        Place order
      </Button>
    </div>
  );
}

const fmt = (n?: number) =>
  (n ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });