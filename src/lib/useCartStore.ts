import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // Adding image so we can show it in the cart!
  note?: string;
}

interface CartState {
  cart: CartItem[];
  totalItems: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      totalItems: 0,
      
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
            totalItems: state.totalItems + 1,
          };
        }
        return {
          cart: [...state.cart, { ...product, quantity: 1 }],
          totalItems: state.totalItems + 1,
        };
      }),

      removeFromCart: (id) => set((state) => {
        const itemToRemove = state.cart.find((item) => item.id === id);
        if (!itemToRemove) return state;
        return {
          cart: state.cart.filter((item) => item.id !== id),
          totalItems: state.totalItems - itemToRemove.quantity,
        };
      }),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity < 1) return state; // Use remove instead of going to 0
        const itemToUpdate = state.cart.find((item) => item.id === id);
        if (!itemToUpdate) return state;
        
        const quantityDifference = quantity - itemToUpdate.quantity;
        return {
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
          totalItems: state.totalItems + quantityDifference,
        };
      }),

      clearCart: () => set({ cart: [], totalItems: 0 }),
    }),
    { name: 'decode-parfum-cart' }
  )
);