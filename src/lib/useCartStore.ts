import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define the structure for individual cart items
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  note?: string;
}

// 2. Define the global state and actions for the cart store
interface CartState {
  cart: CartItem[];
  totalItems: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// 3. Initialize the Zustand store with local storage persistence
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      // 4. Set initial state values
      cart: [],
      totalItems: 0,

      // 5. Action to add a new item or increment quantity if it already exists
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

      // 6. Action to completely remove an item and deduct its total quantity
      removeFromCart: (id) => set((state) => {
        const itemToRemove = state.cart.find((item) => item.id === id);
        
        if (!itemToRemove) return state;
        
        return {
          cart: state.cart.filter((item) => item.id !== id),
          totalItems: state.totalItems - itemToRemove.quantity,
        };
      }),

      // 7. Action to adjust the quantity of a specific item safely
      updateQuantity: (id, quantity) => set((state) => {
        // Prevent setting quantity to zero or less to avoid broken UI states
        if (quantity < 1) return state; 
        
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

      // 8. Action to reset the cart to its empty default state
      clearCart: () => set({ cart: [], totalItems: 0 }),
    }),
    
    // 9. Configure the local storage key for client-side persistence
    { name: 'decode-parfum-cart' }
  )
);