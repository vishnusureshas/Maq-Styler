import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/product';

interface WishlistState {
  items: Product[];
}

const STORAGE_KEY = 'shopcart_wishlist';

const load = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const persist = (items: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota/private-mode errors — wishlist stays in memory
  }
};

const initialState: WishlistState = { items: load() };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index >= 0) state.items.splice(index, 1);
      else state.items.unshift(action.payload);
      persist(state.items);
    },
    removeWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item._id !== action.payload);
      persist(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { toggleWishlist, removeWishlist, clearWishlist } = wishlistSlice.actions;
export const selectWishlist = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const wishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length;
export const isInWishlist =
  (id: string) =>
  (state: { wishlist: WishlistState }): boolean =>
    state.wishlist.items.some((item) => item._id === id);

export default wishlistSlice.reducer;