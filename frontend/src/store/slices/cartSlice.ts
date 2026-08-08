import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../api/cart';
import type { Cart } from '../../types/cart';

interface CartState {
  data: Cart | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  updating: boolean;
  error: string | null;
}

const initialState: CartState = {
  data: null,
  status: 'idle',
  updating: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const { data } = await cartApi.get();
  return data.cart as Cart;
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload: { productId: string; quantity?: number; variant?: Record<string, string> }) => {
    const { data } = await cartApi.add(payload);
    return data.cart as Cart;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async (payload: { productId: string; quantity?: number; variant?: Record<string, string> }) => {
    const { data } = await cartApi.update(payload.productId, {
      quantity: payload.quantity,
      variant: payload.variant,
    });
    return data.cart as Cart;
  }
);

export const removeCartItem = createAsyncThunk('cart/remove', async (productId: string) => {
  const { data } = await cartApi.remove(productId);
  return data.cart as Cart;
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
  const { data } = await cartApi.clear();
  return data.cart as Cart;
});

export const applyCoupon = createAsyncThunk('cart/coupon', async (code: string) => {
  const { data } = await cartApi.applyCoupon(code);
  return data.cart as Cart;
});

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async () => {
  const { data } = await cartApi.removeCoupon();
  return data.cart as Cart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.data = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Failed to load cart';
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(removeCoupon.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addMatcher(
        (action) =>
          [addToCart.pending, updateCartItem.pending, removeCartItem.pending, clearCart.pending].some(
            (p) => p.type === action.type
          ),
        (state) => {
          state.updating = true;
        }
      )
      .addMatcher(
        (action) =>
          [addToCart.fulfilled, updateCartItem.fulfilled, removeCartItem.fulfilled, clearCart.fulfilled].some(
            (f) => f.type === action.type
          ),
        (state, action: ReturnType<typeof addToCart.fulfilled>) => {
          state.updating = false;
          state.data = action.payload as Cart;
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export const selectCart = (state: { cart: CartState }) => state.cart.data;
export const cartItemCount = (state: { cart: CartState }) =>
  state.cart.data?.items.reduce((sum: number, item) => sum + item.quantity, 0) ?? 0;
export default cartSlice.reducer;