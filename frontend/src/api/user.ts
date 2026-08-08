import client from './client';
import type { User, Address } from '../types/user';

export const userApi = {
  getProfile: () => client.get<{ success: boolean; user: User }>('/users/profile'),
  updateProfile: (payload: { name?: string; profileImage?: string; address?: Address }) =>
    client.patch<{ success: boolean; user: User }>('/users/profile', payload),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    client.patch<{ success: boolean }>('/users/change-password', payload),
  deactivate: () => client.delete<{ success: boolean }>('/users/profile'),
};