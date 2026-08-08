import client from './client';
import type { Order } from '../types/order';

export const paymentApi = {
  createIntent: (orderId: string) =>
    client.post<{ clientSecret: string; publishableKey: string }>(
      '/payments/create-payment-intent',
      { orderId }
    ),
  confirmOrder: (orderId: string) =>
    client.post<{ order: Order }>('/payments/confirm', { orderId }),
};

export function getStripeEnvKey(): string {
  return (import.meta.env.VITE_STRIPE_PUBLISHABLE || '').trim();
}