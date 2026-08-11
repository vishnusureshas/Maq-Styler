import client from './client';
import type { OrderStatus, Order } from '../types/order';
import type { User } from '../types/user';
import type { Product } from '../types/product';

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  monthlyRevenue: number;
  recentOrders: Order[];
}

export const adminApi = {
  stats: () => client.get<{ stats: AdminStats }>('/admin/stats'),
  orders: (params: { status?: OrderStatus; page?: number; pageSize?: number } = {}) =>
    client.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, payload: { status: OrderStatus; note?: string }) =>
    client.patch(`/admin/orders/${id}/status`, payload),
  updateOrderPayment: (id: string, payload: { isPaid?: boolean; status?: OrderStatus; paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' }) =>
    client.patch(`/admin/orders/${id}/payment`, payload),
  users: () => client.get<{ users: User[] }>('/admin/users'),
  updateUser: (id: string, payload: { role?: 'user' | 'admin'; isActive?: boolean }) =>
    client.patch(`/admin/users/${id}`, payload),
  deleteUser: (id: string) => client.delete(`/admin/users/${id}`),
  lowStock: () => client.get<{ products: Product[] }>('/admin/products/low-stock'),
  inventory: () => client.get('/admin/inventory'),
  adjustInventory: (id: string, payload: { quantity: number; note?: string }) =>
    client.patch(`/admin/inventory/${id}`, payload),
  salesReport: (params: { from?: string; to?: string } = {}) =>
    client.get('/admin/sales-report', { params }),
};