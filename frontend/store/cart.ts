import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  basePrice: number;
  size: string;
  topping: string;
  unitPrice: number;
  qty: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string, topping: string) => void;
  updateQty: (
    productId: number,
    size: string,
    topping: string,
    qty: number
  ) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === newItem.productId &&
              i.size === newItem.size &&
              i.topping === newItem.topping
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              qty: updated[existingIndex].qty + newItem.qty,
            };
            return { items: updated };
          }

          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId, size, topping) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                i.topping === topping
              )
          ),
        })),

      updateQty: (productId, size, topping, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.size === size &&
            i.topping === topping
              ? { ...i, qty: Math.max(1, qty) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    }),
    {
      name: 'brewlite-cart',
    }
  )
);