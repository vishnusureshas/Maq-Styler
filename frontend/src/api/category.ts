import client from './client';
import type { Category } from '../types/product';

export const categoryApi = {
  create: (payload: Pick<Category, 'name'> & Partial<Pick<Category, 'parent' | 'image' | 'isActive'>>) =>
    client.post<{ success: boolean; category: Category }>('/categories', payload),
  update: (id: string, payload: Partial<Pick<Category, 'name' | 'parent' | 'image' | 'isActive'>>) =>
    client.put<{ success: boolean; category: Category }>(`/categories/${id}`, payload),
  remove: (id: string) => client.delete<{ success: boolean }>(`/categories/${id}`),
};