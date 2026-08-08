import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi, type AdminStats } from '../../api/admin';
import type { Order, OrderStatus } from '../../types/order';
import type { User } from '../../types/user';
import type { Product } from '../../types/product';

interface AdminState {
  stats: AdminStats | null;
  orders: Order[];
  users: User[];
  inventory: unknown[];
  lowStock: Product[];
  salesReport: { date: string; revenue: number; orders: number }[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  orders: [],
  users: [],
  inventory: [],
  lowStock: [],
  salesReport: [],
  status: 'idle',
  error: null,
};

export const fetchStats = createAsyncThunk('admin/stats', async () => {
  const { data } = await adminApi.stats();
  return data.stats as AdminStats;
});

export const fetchAdminOrders = createAsyncThunk(
  'admin/orders',
  async (params: { status?: OrderStatus; page?: number } = {}) => {
    const { data } = await adminApi.orders(params);
    return data.orders as Order[];
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async (payload: { id: string; status: OrderStatus; note?: string }) => {
    const { data } = await adminApi.updateOrderStatus(payload.id, {
      status: payload.status,
      note: payload.note,
    });
    return data.order as Order;
  }
);

export const updateOrderPayment = createAsyncThunk(
  'admin/updateOrderPayment',
  async (payload: { id: string; isPaid: boolean; status?: OrderStatus }) => {
    const { data } = await adminApi.updateOrderPayment(payload.id, payload);
    return data.order as Order;
  }
);

export const fetchUsers = createAsyncThunk('admin/users', async () => {
  const { data } = await adminApi.users();
  return data.users as User[];
});

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async (payload: { id: string; role?: 'user' | 'admin'; isActive?: boolean }) => {
    const { data } = await adminApi.updateUser(payload.id, payload);
    return data.user as User;
  }
);

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id: string) => {
  await adminApi.deleteUser(id);
  return id;
});

export const fetchLowStock = createAsyncThunk('admin/lowStock', async () => {
  const { data } = await adminApi.lowStock();
  return data.products as Product[];
});

export const fetchSalesReport = createAsyncThunk(
  'admin/salesReport',
  async ({ from, to }: { from?: string; to?: string } = {}) => {
    const { data } = await adminApi.salesReport({ from, to });
    const report = (data.report || []) as {
      _id: { year: number; month: number; day: number };
      revenue: number;
      orders: number;
    }[];
    return report
      .map((r) => ({
        date: `${r._id.year}-${String(r._id.month).padStart(2, '0')}-${String(r._id.day).padStart(2, '0')}`,
        revenue: r.revenue,
        orders: r.orders,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }
);

export const fetchInventory = createAsyncThunk('admin/inventory', async () => {
  const { data } = await adminApi.inventory();
  return data.inventory as unknown[];
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) => (o._id === action.payload._id ? action.payload : o));
      })
      .addCase(updateOrderPayment.fulfilled, (state, action) => {
        state.orders = state.orders.map((o) => (o._id === action.payload._id ? action.payload : o));
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) => (u._id === action.payload._id ? action.payload : u));
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.salesReport = action.payload;
      });
  },
});

export const selectAdminStats = (state: { admin: AdminState }) => state.admin.stats;
export const selectAdminOrders = (state: { admin: AdminState }) => state.admin.orders;
export const selectAdminUsers = (state: { admin: AdminState }) => state.admin.users;
export const selectSalesReport = (state: { admin: AdminState }) => state.admin.salesReport;
export default adminSlice.reducer;