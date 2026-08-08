import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../../api/order';
import type { Order, ShippingAddress } from '../../types/order';

interface OrderState {
  orders: Order[];
  current: Order | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  current: null,
  status: 'idle',
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/create',
  async (payload: { shippingAddress: ShippingAddress; paymentMethod: string }) => {
    const { data } = await orderApi.create(payload);
    return data.order as Order;
  }
);

export const fetchMyOrders = createAsyncThunk('order/myOrders', async () => {
  const { data } = await orderApi.myOrders();
  return data.orders as Order[];
});

export const fetchOrderById = createAsyncThunk('order/detail', async (id: string) => {
  const { data } = await orderApi.byId(id);
  return data.order as Order;
});

export const cancelOrder = createAsyncThunk('order/cancel', async (id: string) => {
  const { data } = await orderApi.cancel(id);
  return data.order as Order;
});

export const returnOrder = createAsyncThunk('order/return', async (id: string) => {
  const { data } = await orderApi.return(id);
  return data.order as Order;
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Failed to create order';
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.current = action.payload;
        state.orders = state.orders.map((o) => (o._id === action.payload._id ? action.payload : o));
      })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.current = action.payload;
        state.orders = state.orders.map((o) => (o._id === action.payload._id ? action.payload : o));
      });
  },
});

export const { resetOrder } = orderSlice.actions;
export const selectOrders = (state: { order: OrderState }) => state.order.orders;
export const selectCurrentOrder = (state: { order: OrderState }) => state.order.current;
export default orderSlice.reducer;