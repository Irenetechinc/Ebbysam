import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@workspace/api-client-react';

export interface CartItem {
  id: string; // Composite ID: productId-size-color
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => set((state) => {
        const id = `${item.product.id}-${item.size || 'default'}-${item.color || 'default'}`;
        const existingItem = state.items.find(i => i.id === id);
        
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isOpen: true
          };
        }
        
        return { 
          items: [...state.items, { ...item, id }],
          isOpen: true 
        };
      }),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter(i => i.id !== id) 
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)
      })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'ebby-sam-cart' }
  )
);
